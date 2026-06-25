import "leaflet";

declare module "leaflet" {
  function heatLayer(
    latlngs: L.LatLngExpression[],
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}
