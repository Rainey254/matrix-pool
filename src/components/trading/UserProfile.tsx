
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

interface UserProfileProps {
  onClose: () => void;
  onProfileUpdate?: (firstName: string) => void;
}

const UserProfile = ({ onClose, onProfileUpdate }: UserProfileProps) => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    kycStatus: "verified"
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    miningAlerts: true
  });

  // Load user data on component mount
  useEffect(() => {
    const userData = authService.getCurrentUserData();
    if (userData) {
      setProfile({
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        email: userData.profile.email,
        phone: userData.profile.phone,
        country: userData.profile.country,
        kycStatus: "verified"
      });
      setSettings(userData.settings);
    }
  }, []);

  const handleProfileUpdate = () => {
    const currentEmail = authService.getCurrentUserEmail();
    if (currentEmail) {
      authService.updateUserProfile(currentEmail, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        country: profile.country
      });
      
      // Notify parent component about the profile update
      if (onProfileUpdate) {
        onProfileUpdate(profile.firstName);
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully",
      });
    }
  };

  const handleSettingsUpdate = () => {
    const currentEmail = authService.getCurrentUserEmail();
    if (currentEmail) {
      authService.updateUserSettings(currentEmail, settings);
      
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
      });
    }
  };

  const openTawkTo = () => {
    // Initialize Tawk.to if not already loaded
    if (typeof window !== 'undefined' && !window.Tawk_API) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/686bc7ed3aca89190c9767e8/1ivig9um9';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.head.appendChild(script);
      
      script.onload = () => {
        if (window.Tawk_API && window.Tawk_API.maximize) {
          window.Tawk_API.maximize();
        }
      };
    } else if (window.Tawk_API && window.Tawk_API.maximize) {
      window.Tawk_API.maximize();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Profile</h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-400">
          ✕
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700">
          <TabsTrigger value="profile" className="text-white">Profile</TabsTrigger>
          <TabsTrigger value="settings" className="text-white">Settings</TabsTrigger>
          <TabsTrigger value="kyc" className="text-white">KYC</TabsTrigger>
          <TabsTrigger value="support" className="text-white">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">First Name</label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Last Name</label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email</label>
                <Input
                  value={profile.email}
                  className="bg-slate-700 border-slate-600 text-white"
                  type="email"
                  disabled
                  placeholder="Email cannot be changed"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Phone Number</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  type="tel"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Country</label>
                <Input
                  value={profile.country}
                  onChange={(e) => setProfile({...profile, country: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter country"
                />
              </div>

              <Button onClick={handleProfileUpdate} className="w-full bg-purple-600 hover:bg-purple-700">
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive mining updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-400">Receive alerts via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">Enhanced account security</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Mining Alerts</p>
                  <p className="text-sm text-gray-400">Get notified of mining opportunities</p>
                </div>
                <Switch
                  checked={settings.miningAlerts}
                  onCheckedChange={(checked) => setSettings({...settings, miningAlerts: checked})}
                />
              </div>

              <Button onClick={handleSettingsUpdate} className="w-full bg-purple-600 hover:bg-purple-700">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                KYC Verification
                <Badge className="bg-green-600">Verified</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                <p className="text-green-400 font-medium">✓ Identity Verified</p>
                <p className="text-sm text-gray-400 mt-1">Your account is fully verified for mining</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">Document Upload</span>
                  <Badge className="bg-green-600">Complete</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">Identity Verification</span>
                  <Badge className="bg-green-600">Complete</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">Address Verification</span>
                  <Badge className="bg-green-600">Complete</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Customer Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Our support team is here to help you with any questions or issues you may have.
                </p>
                <Button 
                  onClick={openTawkTo}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start Live Chat
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="text-white font-medium">⏰ Support Hours</p>
                  <p className="text-gray-400 text-sm">24/7 Live Chat Available</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <p className="text-white font-medium">🎯 Response Time</p>
                  <p className="text-gray-400 text-sm">Usually within 5 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
