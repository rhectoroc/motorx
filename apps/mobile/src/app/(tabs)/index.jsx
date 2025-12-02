import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Car, Search, Plus, Filter } from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, loading: userLoading } = useUser();
  const { signIn } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const response = await fetch("/api/vehicles");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const onRefresh = () => {
    fetchVehicles(true);
  };

  const handleVehiclePress = (vin) => {
    router.push(`/(tabs)/vehicle/${vin}`);
  };

  const formatCurrency = (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return { backgroundColor: "#DEF7EC", color: "#047857" };
      case "in_transit":
        return { backgroundColor: "#FEF3C7", color: "#92400E" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#374151" };
    }
  };

  if (userLoading || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text
          style={{
            color: "#6B7280",
            marginTop: 12,
            fontSize: 16,
          }}
        >
          Loading vehicles...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="dark" />
        <Text
          style={{
            color: "#6B7280",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Please sign in to view your vehicles
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => signIn()}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Car size={32} color="#2563EB" />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginLeft: 12,
              }}
            >
              MotorX
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#2563EB",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              Alert.alert(
                "Add Vehicle",
                "Vehicle creation form will be implemented soon",
              );
            }}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: "#6B7280",
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Welcome, {user?.name || user?.email}
        </Text>
      </View>

      {/* Vehicle List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FECACA",
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {vehicles.length === 0 ? (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Car size={48} color="#9CA3AF" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No vehicles yet
            </Text>
            <Text
              style={{
                color: "#6B7280",
                textAlign: "center",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Add your first vehicle to start tracking its services and costs
            </Text>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                marginBottom: 16,
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#2563EB",
                  }}
                >
                  {vehicles.length}
                </Text>
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Total Vehicles
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#059669",
                  }}
                >
                  {
                    vehicles.filter((v) => v.current_status === "completed")
                      .length
                  }
                </Text>
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Completed
                </Text>
              </View>
            </View>

            {/* Vehicle Cards */}
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                onPress={() => handleVehiclePress(vehicle.vin)}
              >
                <View style={{ padding: 16 }}>
                  {/* Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {vehicle.vin}
                      </Text>
                      {vehicle.description && (
                        <Text
                          style={{
                            color: "#6B7280",
                            fontSize: 14,
                          }}
                        >
                          {vehicle.description}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        {
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginLeft: 12,
                        },
                        getStatusColor(vehicle.current_status),
                      ]}
                    >
                      <Text
                        style={[
                          { fontSize: 12, fontWeight: "500" },
                          {
                            color: getStatusColor(vehicle.current_status).color,
                          },
                        ]}
                      >
                        {vehicle.current_status
                          ?.replace("_", " ")
                          .toUpperCase() || "PENDING"}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={{ gap: 8 }}>
                    {vehicle.client_name && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{ color: "#6B7280", fontSize: 14, width: 80 }}
                        >
                          Client:
                        </Text>
                        <Text
                          style={{ color: "#111827", fontSize: 14, flex: 1 }}
                        >
                          {vehicle.client_name}
                        </Text>
                      </View>
                    )}

                    {vehicle.auction_name && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{ color: "#6B7280", fontSize: 14, width: 80 }}
                        >
                          Auction:
                        </Text>
                        <Text
                          style={{ color: "#111827", fontSize: 14, flex: 1 }}
                        >
                          {vehicle.auction_name}
                        </Text>
                      </View>
                    )}

                    {vehicle.purchase_price && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{ color: "#6B7280", fontSize: 14, width: 80 }}
                        >
                          Price:
                        </Text>
                        <Text
                          style={{
                            color: "#059669",
                            fontSize: 14,
                            fontWeight: "600",
                            flex: 1,
                          }}
                        >
                          {formatCurrency(vehicle.purchase_price)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
