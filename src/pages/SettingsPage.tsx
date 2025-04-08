
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const SettingsPage = () => {
  return (
    <Layout>
      <div className="py-8 max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
        
        <div className="glass-panel rounded-xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold mb-4">Account</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Enter your name" defaultValue="Anonymous" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            
            <Button 
              onClick={() => toast.success('Settings saved!')} 
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
              <RadioGroup defaultValue="portrait">
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
              <Input id="default-author" placeholder="Enter default author name" defaultValue="Anonymous" />
            </div>
            
            <Button 
              onClick={() => toast.success('Default settings saved!')} 
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
              <RadioGroup defaultValue="cartoon">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cartoon" id="cartoon" />
                  <Label htmlFor="cartoon">Cartoon Style</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="watercolor" id="watercolor" />
                  <Label htmlFor="watercolor">Watercolor Painting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pencil" id="pencil" />
                  <Label htmlFor="pencil">Pencil Sketch</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              onClick={() => toast.success('Image settings saved!')} 
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
