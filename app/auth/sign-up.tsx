import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'customer' | 'retailer'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signUp(email, password, fullName, userType);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/auth/sign-in');
    }
  };

  return (
    <LinearGradient colors={['#0EA5E9', '#06B6D4']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.logo}>Local Fresh</Text>
            <Text style={styles.subtitle}>Create Account</Text>

            <View style={styles.form}>
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'customer' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('customer')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === 'customer' && styles.userTypeTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'retailer' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('retailer')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === 'retailer' && styles.userTypeTextActive,
                    ]}
                  >
                    Retailer
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0EA5E9" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/auth/sign-in" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: 700,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  userTypeButtonActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#EFF6FF',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  userTypeTextActive: {
    color: '#0EA5E9',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
  },
});
