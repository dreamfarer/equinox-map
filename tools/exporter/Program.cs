// Export everything the map and the database need from the game files, exactly
// like FModel's "Save Folder's Packages Properties (.json)" and "Save Folder's
// Packages Textures" would, but without any clicking.
//
// Usage:
//   npm run game:export
//   npm run game:export -- --game "D:\Games\Project ThunderHorse" --out some/dir

using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using CUE4Parse.Compression;
using CUE4Parse.Encryption.Aes;
using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.MappingsProvider.Usmap;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.Core.Misc;
using CUE4Parse.UE4.Versions;
using CUE4Parse_Conversion.Options;
using CUE4Parse_Conversion.Textures;
using CUE4Parse_Conversion.Textures.BC;
using Microsoft.Win32;
using Newtonsoft.Json;
using Serilog;
using Serilog.Core;
using Serilog.Events;

const string steamAppId = "3258290";
const string exportsPrefix = "fmodel/Output/Exports/";

// The directories of the game whose packages are exported as properties.
// The maps are added from scripts/extract-resources.json.
var propertyDirectories = new List<string>
{
    "ThunderHorse/Content/Blueprints/Items",
    "ThunderHorse/Content/Blueprints/Data",
};

// The directories of the game whose textures are exported as images.
// Classes of the maps the parser can't read even with a fresh mapping. Nothing
// depends on them, so they don't fail the export.
HashSet<string> knownUnreadableClasses = ["State", "BP_NpcPathToState_C"];

string[] textureDirectories =
[
    "ThunderHorse/Content/UserInterface/Textures/Items/Character/Gear",
    "ThunderHorse/Content/UserInterface/Textures/Items/Horse/Gear",
    "ThunderHorse/Content/UserInterface/Textures/Items/Collectables",
    "ThunderHorse/Content/UserInterface/Textures/Buttons",
];

try
{
    return Run(args);
}
catch (Exception error)
{
    Console.Error.WriteLine($"Error: {error.Message}");
    return 1;
}

int Run(string[] arguments)
{
    var root = FindProjectRoot();
    var gameDirectory = ReadOption(arguments, "--game") ?? FindGameDirectory();
    var outputDirectory = Path.GetFullPath(
        ReadOption(arguments, "--out") ?? Path.Combine(root, exportsPrefix)
    );
    var mappingPath = Directory
        .EnumerateFiles(Path.Combine(root, "dumper-7"), "*.usmap", SearchOption.AllDirectories)
        .OrderByDescending(File.GetLastWriteTimeUtc)
        .FirstOrDefault()
        ?? throw new Exception("No .usmap mapping found in dumper-7/, see how-to-update.md.");

    propertyDirectories.AddRange(ReadMapDirectories(root));

    var paksDirectory = Path.Combine(gameDirectory, "ThunderHorse", "Content", "Paks");
    if (!Directory.Exists(paksDirectory))
    {
        throw new Exception($"{paksDirectory} doesn't exist. Pass the directory of the game with --game.");
    }

    Console.WriteLine($"Game:    {gameDirectory}");
    Console.WriteLine($"Mapping: {Path.GetRelativePath(root, mappingPath)}");
    Console.WriteLine($"Output:  {outputDirectory}");

    // The parser doesn't throw if it can't read an object, it only logs it and
    // exports the object with properties missing.
    var readErrors = new ReadErrorSink();
    Log.Logger = new LoggerConfiguration().MinimumLevel.Error().WriteTo.Sink(readErrors).CreateLogger();

    InitializeCompression(Path.Combine(root, "tools", "exporter", ".data"));

    var watch = Stopwatch.StartNew();
    var provider = new DefaultFileProvider(
        paksDirectory,
        SearchOption.TopDirectoryOnly,
        new VersionContainer(EGame.GAME_UE5_5),
        StringComparer.OrdinalIgnoreCase
    );
    provider.MappingsContainer = new FileUsmapTypeMappingsProvider(mappingPath, StringComparer.OrdinalIgnoreCase);
    provider.Initialize();
    provider.SubmitKey(new FGuid(), new FAesKey(new byte[32]));
    provider.PostMount();
    provider.LoadVirtualPaths();
    provider.LoadLocalization(ELanguage.English);

    var failures = new ConcurrentBag<string>();
    var jsonCount = 0;
    var textureCount = 0;

    foreach (var directory in propertyDirectories)
    {
        var packages = ListPackages(provider, directory);
        if (packages.Count == 0)
        {
            throw new Exception($"{directory} doesn't exist in the game files anymore.");
        }
        ResetDirectory(Path.Combine(outputDirectory, directory));

        Parallel.ForEach(packages, package =>
        {
            try
            {
                var exports = provider.LoadPackage(package).GetExports();
                var json = JsonConvert.SerializeObject(exports, Formatting.Indented);
                var target = Path.Combine(outputDirectory, Path.ChangeExtension(package.Path, ".json"));
                Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                WriteFile(target, () => File.WriteAllText(target, json));
                Interlocked.Increment(ref jsonCount);
            }
            catch (Exception error)
            {
                failures.Add($"{package.Path}: {error.Message}");
            }
        });
        Console.WriteLine($"Exported the properties of {packages.Count} package(s) of {directory}");
    }

    foreach (var directory in textureDirectories)
    {
        var packages = ListPackages(provider, directory);
        if (packages.Count == 0)
        {
            throw new Exception($"{directory} doesn't exist in the game files anymore.");
        }
        ResetDirectory(Path.Combine(outputDirectory, directory));

        Parallel.ForEach(packages, package =>
        {
            try
            {
                foreach (var texture in provider.LoadPackage(package).GetExports().OfType<UTexture2D>())
                {
                    var image = texture.Decode()
                        ?? throw new Exception($"{texture.Name} couldn't be decoded.");
                    var target = Path.Combine(
                        outputDirectory,
                        Path.GetDirectoryName(package.Path)!,
                        $"{texture.Name}.png"
                    );
                    Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                    var png = image.Encode(ETextureFormat.Png, false, out _);
                    WriteFile(target, () => File.WriteAllBytes(target, png));
                    Interlocked.Increment(ref textureCount);
                }
            }
            catch (Exception error)
            {
                failures.Add($"{package.Path}: {error.Message}");
            }
        });
        Console.WriteLine($"Exported the textures of {packages.Count} package(s) of {directory}");
    }

    Console.WriteLine(
        $"Exported {jsonCount} package(s) and {textureCount} texture(s) in {watch.Elapsed.TotalSeconds:F0} s."
    );

    if (!failures.IsEmpty)
    {
        Console.Error.WriteLine($"\n{failures.Count} package(s) couldn't be exported:");
        foreach (var failure in failures.Order().Take(20)) Console.Error.WriteLine($"- {failure}");
        Console.Error.WriteLine("\nError: The export is incomplete, run it again.");
        return 1;
    }

    var ignored = readErrors.Classes.Keys.Where(knownUnreadableClasses.Contains).Order().ToList();
    if (ignored.Count > 0)
    {
        Console.WriteLine($"Ignored the classes that can't be read with any mapping: {string.Join(", ", ignored)}");
    }

    var classes = readErrors.Classes
        .Where(entry => !knownUnreadableClasses.Contains(entry.Key))
        .OrderByDescending(entry => entry.Value)
        .ToList();
    if (classes.Count > 0)
    {
        Console.Error.WriteLine(
            $"\nObjects of {classes.Count} class(es) couldn't be read completely and were exported with properties missing:"
        );
        foreach (var (name, count) in classes.Take(20)) Console.Error.WriteLine($"- {name} ({count}x)");
        if (classes.Count > 20) Console.Error.WriteLine($"- and {classes.Count - 20} more");
        Console.Error.WriteLine(
            "\nError: The mapping doesn't fit this version of the game. Generate it again as described in "
                + "\"Export the Mapping\" of how-to-update.md and run the export again. If a class still can't be "
                + "read with a fresh mapping and nothing depends on it, add it to knownUnreadableClasses."
        );
        return 1;
    }
    return 0;
}

static string? ReadOption(string[] arguments, string name)
{
    var index = Array.IndexOf(arguments, name);
    return index >= 0 && index + 1 < arguments.Length ? arguments[index + 1] : null;
}

static string FindProjectRoot()
{
    for (var directory = new DirectoryInfo(Directory.GetCurrentDirectory()); directory != null; directory = directory.Parent)
    {
        if (File.Exists(Path.Combine(directory.FullName, "how-to-update.md"))) return directory.FullName;
    }
    throw new Exception("Run the exporter from within the project.");
}

/// Ask Steam where the game is installed.
static string FindGameDirectory()
{
    var steamPath = OperatingSystem.IsWindows()
        ? Registry.GetValue(@"HKEY_CURRENT_USER\Software\Valve\Steam", "SteamPath", null) as string
        : null;
    var libraries = steamPath == null ? null : Path.Combine(steamPath, "steamapps", "libraryfolders.vdf");

    if (libraries != null && File.Exists(libraries))
    {
        foreach (Match match in Regex.Matches(File.ReadAllText(libraries), "\"path\"\\s+\"(.+?)\""))
        {
            var steamApps = Path.Combine(match.Groups[1].Value.Replace(@"\\", @"\"), "steamapps");
            var manifest = Path.Combine(steamApps, $"appmanifest_{steamAppId}.acf");
            if (!File.Exists(manifest)) continue;

            var installDirectory = Regex.Match(File.ReadAllText(manifest), "\"installdir\"\\s+\"(.+?)\"");
            if (installDirectory.Success)
            {
                return Path.Combine(steamApps, "common", installDirectory.Groups[1].Value);
            }
        }
    }
    throw new Exception("Couldn't find the game through Steam. Pass its directory with --game.");
}

/// The map directories are shared with the script that extracts the resources.
static IEnumerable<string> ReadMapDirectories(string root)
{
    var config = Path.Combine(root, "scripts", "extract-resources.json");
    using var document = JsonDocument.Parse(File.ReadAllText(config));

    foreach (var source in document.RootElement.GetProperty("sources").EnumerateArray())
    {
        var directory = source.GetProperty("dir").GetString()!;
        if (!directory.StartsWith(exportsPrefix))
        {
            throw new Exception($"\"{directory}\" of {config} must start with {exportsPrefix}");
        }
        yield return directory[exportsPrefix.Length..];
    }
}

static void InitializeCompression(string dataDirectory)
{
    Directory.CreateDirectory(dataDirectory);

    var oodlePath = Path.Combine(dataDirectory, OodleHelper.OodleFileName);
    if (!File.Exists(oodlePath)) OodleHelper.DownloadOodleDll(ref oodlePath);
    OodleHelper.Initialize(oodlePath);

    // The texture decoder FModel uses, so that the icons come out identical.
    var detexPath = Path.Combine(dataDirectory, DetexHelper.DLL_NAME);
    if (!File.Exists(detexPath)) DetexHelper.LoadDll(detexPath);
    DetexHelper.Initialize(detexPath);
    TextureDecoder.UseAssetRipperTextureDecoder = false;

    var zlibPath = Path.Combine(dataDirectory, ZlibHelper.DllName);
    if (!File.Exists(zlibPath)) ZlibHelper.DownloadDll(zlibPath);
    ZlibHelper.Initialize(zlibPath);
}

static List<GameFile> ListPackages(DefaultFileProvider provider, string directory)
{
    var prefix = directory.TrimEnd('/') + "/";
    return provider.Files.Values
        .Where(file => file.Path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        .Where(file => file.Extension is "uasset" or "umap")
        .OrderBy(file => file.Path, StringComparer.Ordinal)
        .ToList();
}

/// Writing thousands of files at once occasionally fails for a single one,
/// for example while an antivirus scans it.
static void WriteFile(string target, Action write)
{
    for (var attempt = 1; ; attempt++)
    {
        try
        {
            write();
            return;
        }
        catch (IOException) when (attempt < 5)
        {
            Thread.Sleep(200 * attempt);
        }
    }
}

static void ResetDirectory(string directory)
{
    if (Directory.Exists(directory)) Directory.Delete(directory, true);
    Directory.CreateDirectory(directory);
}

/// Collects the classes of the objects the parser couldn't read.
class ReadErrorSink : ILogEventSink
{
    public ConcurrentDictionary<string, int> Classes { get; } = new();

    public void Emit(LogEvent logEvent)
    {
        var name = Regex.Match(logEvent.RenderMessage(), "\"(.+?)\"") is { Success: true } match
            ? match.Groups[1].Value
            : logEvent.RenderMessage();
        Classes.AddOrUpdate(name, 1, (_, count) => count + 1);
    }
}
