import { configureAbly, useChannel } from "@ably-labs/react-hooks";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Button } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect, useRef } from "react";

configureAbly({
  key: "3R-A4w.SlcxQg:CTuev7gfjEyqsUnd-e8-ajlEhvNUF23rLpsl_MBOnf0",
  clientId: Date.now() + "",
});

export default function App() {
  const [location, setLocation] = useState(null);

  const mapRef = useRef();

  const [channel] = useChannel("gps-tracking", (message) => {
    console.log({ message });
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      Location.watchPositionAsync({}, (location) => {
        setLocation(location);
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelte: 0.1,
          },
          500
        );
        channel.publish("message", location);
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        showsCompass
        showsTraffic
        mapType="hybrid"
        provider="google"
        style={styles.map}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <View style={styles.Marker}>
              <Text>Me</Text>
            </View>
          </Marker>
        )}
      </MapView>
      <View style={styles.center}>
        <Button
          title="My location"
          onPress={() => {
            mapRef.current.animateToRegion(
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelte: 0.01,
              },
              500
            );
          }}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  Marker: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 50,
  },
  center: {
    position: "absolute",
    marginTop: 610,
    right: 20,
    backgroundColor: "white",
    borderRadius: 30,
  },
});
