import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Map({ children, ...props }: any) {
  return <View style={StyleSheet.absoluteFill} {...props}>{children}</View>;
}

export function Marker(props: any) {
  return null;
}

export function Polyline(props: any) {
  return null;
}
