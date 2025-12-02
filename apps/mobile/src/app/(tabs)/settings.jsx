import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Settings,
  User,
  LogOut,
  Shield,
  HelpCircle,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  if (userLoading) {
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
        <Text style={{ color: "#6B7280", fontSize: 16 }}>Loading...</Text>
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Settings size={32} color="#6B7280" />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#111827",
              marginLeft: 12,
            }}
          >
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        {user && (
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <User size={24} color="#2563EB" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginLeft: 12,
                }}
              >
                Profile
              </Text>
            </View>

            <View style={{ marginLeft: 36 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {user.name || "No name provided"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                {user.email}
              </Text>
              <View
                style={{
                  backgroundColor:
                    user.role === "admin" ? "#DBEAFE" : "#F3F4F6",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: user.role === "admin" ? "#1D4ED8" : "#6B7280",
                    textTransform: "capitalize",
                  }}
                >
                  {user.role || "client"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* App Information */}
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <HelpCircle size={24} color="#10B981" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginLeft: 12,
              }}
            >
              About
            </Text>
          </View>

          <View style={{ marginLeft: 36 }}>
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 2,
                }}
              >
                App Name
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                MotorX Mobile
              </Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 2,
                }}
              >
                Version
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                1.0.0
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 2,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 20,
                }}
              >
                Vehicle management and service tracking application for
                automotive businesses.
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Features */}
        {user?.role === "admin" && (
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Shield size={24} color="#8B5CF6" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginLeft: 12,
                }}
              >
                Admin Features
              </Text>
            </View>

            <View style={{ marginLeft: 36 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 20,
                }}
              >
                Access to admin panel, data import/export, user management, and
                system configuration available on the web version.
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: "#8B5CF6",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  marginTop: 12,
                  alignSelf: "flex-start",
                }}
                onPress={() => {
                  Alert.alert(
                    "Admin Panel",
                    "Admin features are available on the web version. Please use a browser to access the full admin interface.",
                  );
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Learn More
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Actions */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
            onPress={() => {
              Alert.alert(
                "Support",
                "For support and assistance, please contact your system administrator or visit the help documentation on the web version.",
              );
            }}
          >
            <HelpCircle size={24} color="#6B7280" />
            <Text
              style={{
                fontSize: 16,
                color: "#111827",
                marginLeft: 12,
                flex: 1,
              }}
            >
              Help & Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
            onPress={handleSignOut}
          >
            <LogOut size={24} color="#EF4444" />
            <Text
              style={{
                fontSize: 16,
                color: "#EF4444",
                fontWeight: "500",
                marginLeft: 12,
                flex: 1,
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View
          style={{
            alignItems: "center",
            marginTop: 24,
            paddingBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "center",
            }}
          >
            MotorX Mobile{"\n"}© {new Date().getFullYear()} All rights reserved
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
