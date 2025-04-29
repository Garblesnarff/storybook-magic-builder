import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';

const SettingsPage = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </Layout>
  );
};

export default SettingsPage;
