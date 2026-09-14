import React from 'react';
import MapView, { Marker as RNMarker, Polyline as RNPolyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export function Map({ children, ...props }: any) {
  return <MapView provider="google" style={StyleSheet.absoluteFill} {...props}>{children}</MapView>;
}

export function Marker(props: any) {
  return <RNMarker {...props} />;
}

export function Polyline(props: any) {
  return <RNPolyline {...props} />;
}
