'use client'
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Marker } from '../types/marker'
import styles from "./map.module.css";

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null)

    const exportMarkerDebug = (map: maplibregl.Map, lng: number, lat: number) => {
        const marker: Marker = {
            title: "",
            subtitle: "",
            type: "",
            character: "",
            map: "greenisland",
            lng,
            lat,
        }
        const markerJson = JSON.stringify(marker, null, 2) + ','
        console.log(markerJson)
        navigator.clipboard.writeText(markerJson)
        new maplibregl.Marker()
            .setLngLat([lng, lat])
            .addTo(map)
    }


    useEffect(() => {
        if (!mapContainer.current) return

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    gameMap: {
                        type: 'raster',
                        tiles: ['https://cdn.equinoxmap.app/greenisland/{z}/{y}/{x}.png'],
                        tileSize: 256,
                        scheme: 'xyz',
                        maxzoom: 5,
                        bounds: [-180, -71, 39.7, 85],
                        attribution: 'Blue Scarab Entertainment'
                    },
                },
                layers: [
                    {
                        id: 'gameMapLayer',
                        type: 'raster',
                        source: 'gameMap',
                    },
                ],
            },
            center: [0, 0],
            zoom: 2,
            minZoom: 0,
            maxZoom: 6,
            interactive: true,
            bearingSnap: 0,
            pitchWithRotate: false,
            dragRotate: false,
            transformRequest: (url) => ({ url })
        })

        map.setMaxBounds([[-180, -71], [39.7, 85]])
        map.scrollZoom.enable()

        map.on('click', (e) => {
            const { lng, lat } = e.lngLat
            exportMarkerDebug(map, lng, lat)
        })

        return () => map.remove()
    }, [])

    return <div ref={mapContainer} className={styles.map} />
}