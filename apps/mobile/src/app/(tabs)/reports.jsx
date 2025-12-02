import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  BarChart3,
  DollarSign,
  Car,
  TrendingUp,
  Download,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

const { width: screenWidth } = Dimensions.get("window");

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, loading: userLoading } = useUser();
  const { signIn } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const response = await fetch("/api/reports/financial");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);

  const onRefresh = () => {
    fetchReportData(true);
  };

  const formatCurrency = (value) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value) => {
    if (!value) return "$0";
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
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
          Loading reports...
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
          Please sign in to view reports
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
            <BarChart3 size={32} color="#10B981" />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginLeft: 12,
              }}
            >
              Reports
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#10B981",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() => {
              // Export functionality would be implemented here
              alert("Export feature coming soon");
            }}
          >
            <Download size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: "#6B7280",
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Financial insights and analytics
        </Text>
      </View>

      {/* Report Content */}
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

        {reportData ? (
          <>
            {/* Overview Cards */}
            <View style={{ gap: 12, marginBottom: 24 }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Car size={24} color="#2563EB" />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginLeft: 8,
                    }}
                  >
                    Total Vehicles
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#2563EB",
                  }}
                >
                  {reportData.overview.total_vehicles}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <DollarSign size={24} color="#10B981" />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginLeft: 8,
                    }}
                  >
                    Total Investment
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#10B981",
                  }}
                >
                  {formatCompactCurrency(reportData.overview.total_investment)}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <View>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>
                      Purchase
                    </Text>
                    <Text
                      style={{
                        color: "#111827",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {formatCompactCurrency(
                        reportData.overview.total_purchase_value,
                      )}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>
                      Services
                    </Text>
                    <Text
                      style={{
                        color: "#111827",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {formatCompactCurrency(
                        reportData.overview.total_service_costs,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Vehicle Status Distribution */}
            {reportData.statusDistribution &&
              reportData.statusDistribution.length > 0 && (
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 16,
                    }}
                  >
                    Vehicle Status
                  </Text>

                  {reportData.statusDistribution.map((status, index) => {
                    const total = reportData.statusDistribution.reduce(
                      (sum, s) => sum + parseInt(s.count),
                      0,
                    );
                    const percentage =
                      total > 0 ? (parseInt(status.count) / total) * 100 : 0;

                    const getStatusColor = (statusName) => {
                      switch (statusName) {
                        case "completed":
                          return "#10B981";
                        case "in_transit":
                          return "#F59E0B";
                        default:
                          return "#6B7280";
                      }
                    };

                    return (
                      <View key={index} style={{ marginBottom: 12 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: "#111827",
                              fontSize: 14,
                              textTransform: "capitalize",
                            }}
                          >
                            {status.current_status?.replace("_", " ") ||
                              "Unknown"}
                          </Text>
                          <Text style={{ color: "#6B7280", fontSize: 14 }}>
                            {status.count} ({percentage.toFixed(0)}%)
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 8,
                            backgroundColor: "#F3F4F6",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${percentage}%`,
                              backgroundColor: getStatusColor(
                                status.current_status,
                              ),
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

            {/* Service Cost Breakdown */}
            {reportData.serviceCostBreakdown &&
              reportData.serviceCostBreakdown.length > 0 && (
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 16,
                    }}
                  >
                    Top Services by Cost
                  </Text>

                  {reportData.serviceCostBreakdown
                    .slice(0, 5)
                    .map((service, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth: index < 4 ? 1 : 0,
                          borderBottomColor: "#F3F4F6",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: "#111827",
                              fontSize: 14,
                              fontWeight: "500",
                            }}
                          >
                            {service.service_name}
                          </Text>
                          <Text
                            style={{
                              color: "#6B7280",
                              fontSize: 12,
                              textTransform: "capitalize",
                            }}
                          >
                            {service.service_category} • {service.service_count}{" "}
                            uses
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: "#10B981",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          {formatCompactCurrency(service.total_service_cost)}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

            {/* Monthly Trends */}
            {reportData.monthlyTrends &&
              reportData.monthlyTrends.length > 0 && (
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 16,
                    }}
                  >
                    Recent Activity
                  </Text>

                  {reportData.monthlyTrends.slice(0, 3).map((trend, index) => {
                    const month = new Date(trend.month).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                      },
                    );

                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          borderBottomWidth: index < 2 ? 1 : 0,
                          borderBottomColor: "#F3F4F6",
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              color: "#111827",
                              fontSize: 14,
                              fontWeight: "500",
                            }}
                          >
                            {month}
                          </Text>
                          <Text
                            style={{
                              color: "#6B7280",
                              fontSize: 12,
                            }}
                          >
                            {trend.vehicles_purchased} vehicles
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              color: "#10B981",
                              fontSize: 16,
                              fontWeight: "600",
                            }}
                          >
                            {formatCompactCurrency(
                              trend.monthly_purchase_value,
                            )}
                          </Text>
                          <Text
                            style={{
                              color: "#6B7280",
                              fontSize: 12,
                            }}
                          >
                            +
                            {formatCompactCurrency(trend.monthly_service_costs)}{" "}
                            services
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
          </>
        ) : (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <BarChart3 size={48} color="#9CA3AF" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No data available
            </Text>
            <Text
              style={{
                color: "#6B7280",
                textAlign: "center",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Add some vehicles to see your financial reports
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
