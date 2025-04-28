import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { IMAGE_STYLES } from '@/types/book';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();

  const [defaultAuthor, setDefaultAuthor] = useState('Anonymous');
  const [defaultOrientation, setDefaultOrientation] = useState('portrait');
  const [defaultImageStyle, setDefaultImageStyle] = useState('CARTOON');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedAuthor = localStorage.getItem('defaultAuthor');
    const storedOrientation = localStorage.getItem('defaultOrientation');
    const storedImageStyle = localStorage.getItem('defaultImageStyle');
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedAuthor) setDefaultAuthor(storedAuthor);
    if (storedOrientation) setDefaultOrientation(storedOrientation);
    if (storedImageStyle) setDefaultImageStyle(storedImageStyle);
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const saveAccountSettings = () => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    toast.success('Account settings saved!');
  };

  const saveDefaultBookSettings = () => {
    localStorage.setItem('defaultAuthor', defaultAuthor);
    localStorage.setItem('defaultOrientation', defaultOrientation);
    toast.success('Default book settings saved!');
  };

  const saveImageSettings = () => {
    localStorage.setItem('defaultImageStyle', defaultImageStyle);
    toast.success('Image settings saved!');
  };

  return (
    <Layout>
      <div className="py-8 max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
        
        <div className="glass-panel rounded-xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold mb-4">Account</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={saveAccountSettings} 
              className="mt-2"
            >
              Save Account Settings
            </Button>
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold mb-4">Default Book Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Page Orientation</Label>
              <RadioGroup 
                value={defaultOrientation}
                onValueChange={(value) => setDefaultOrientation(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait (8.5" × 11")</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape (11" × 8.5")</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-author">Default Author Name</Label>
              <Input 
                id="default-author" 
                placeholder="Enter default author name" 
                value={defaultAuthor}
                onChange={(e) => setDefaultAuthor(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={saveDefaultBookSettings} 
              className="mt-2"
            >
              Save Default Settings
            </Button>
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Image Generation</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Configure your image generation preferences. These settings will be applied when generating new images.
            </p>
            
            <div className="space-y-2">
              <Label>Default Image Style</Label>
              <RadioGroup 
                value={defaultImageStyle}
                onValueChange={(value) => setDefaultImageStyle(value)}
              >
                {IMAGE_STYLES.map(style => (
                  <div className="flex items-center space-x-2" key={style.id}>
                    <RadioGroupItem value={style.id} id={style.id.toLowerCase()} />
                    <Label htmlFor={style.id.toLowerCase()}>{style.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Button 
              onClick={saveImageSettings} 
              className="mt-2"
            >
              Save Image Settings
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
