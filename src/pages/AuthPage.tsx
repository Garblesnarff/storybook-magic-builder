
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthPage = () => {
  const { user, loading, signIn, signUp } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in, redirect to books page
  if (user && !loading) {
    return <Navigate to="/books" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout rootClassName="bg-books-background bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Children's Book Generator</CardTitle>
            <CardDescription>Sign in to create amazing children's books</CardDescription>
          </CardHeader>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 mx-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Sign Up'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Tabs>

          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <p>{activeTab === 'login' ? "Don't have an account? Switch to Register" : "Already have an account? Switch to Login"}</p>
            {activeTab === 'register' && (
              <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AuthPage;
