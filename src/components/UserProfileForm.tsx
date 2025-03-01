
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types";
import { calculateMaintenanceCalories, calculateTargetCalories } from "@/lib/calorieUtils";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const dietaryOptions = [
  "Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", 
  "Gluten-Free", "Dairy-Free", "Low-Carb", "Low-Fat", 
  "Mediterranean", "High-Protein", "Organic", "Halal", "Kosher"
];

interface UserProfileFormProps {
  onProfileComplete: (profile: UserProfile) => void;
}

export function UserProfileForm({ onProfileComplete }: UserProfileFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: "",
    age: 30,
    gender: "male" as UserProfile["gender"],
    weight: 70,
    height: 170,
    activityLevel: "moderate" as UserProfile["activityLevel"],
    goal: "maintain" as UserProfile["goal"],
    nationality: "",
    dietaryPreferences: [] as string[],
    customPreference: ""
  });
  
  const { toast } = useToast();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddDietaryPreference = () => {
    if (formData.customPreference.trim()) {
      if (!formData.dietaryPreferences.includes(formData.customPreference.trim())) {
        setFormData(prev => ({
          ...prev,
          dietaryPreferences: [...prev.dietaryPreferences, prev.customPreference.trim()],
          customPreference: ""
        }));
      } else {
        toast({
          title: "Preference already added",
          description: "This dietary preference is already in your list",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleSelectDietaryPreference = (preference: string) => {
    if (!formData.dietaryPreferences.includes(preference)) {
      setFormData(prev => ({
        ...prev,
        dietaryPreferences: [...prev.dietaryPreferences, preference]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dietaryPreferences: prev.dietaryPreferences.filter(p => p !== preference)
      }));
    }
  };
  
  const handleRemovePreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.filter(p => p !== preference)
    }));
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name) {
        toast({
          title: "Name required",
          description: "Please enter your name to continue",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };
  
  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nationality) {
      toast({
        title: "Nationality required",
        description: "Please enter your nationality to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.dietaryPreferences.length === 0) {
      toast({
        title: "Dietary preferences required",
        description: "Please select at least one dietary preference",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate maintenance and target calories
    const maintenance = calculateMaintenanceCalories({
      name: formData.name,
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      nationality: formData.nationality,
      dietaryPreferences: formData.dietaryPreferences
    });
    
    const target = calculateTargetCalories(maintenance, formData.goal);
    
    // Create the complete user profile
    const completeProfile: UserProfile = {
      name: formData.name,
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      nationality: formData.nationality,
      dietaryPreferences: formData.dietaryPreferences,
      maintenanceCalories: maintenance,
      targetCalories: target
    };
    
    // Pass the profile to the parent component
    onProfileComplete(completeProfile);
    
    toast({
      title: "Profile created!",
      description: `Your maintenance calories: ${maintenance}, target: ${target}`,
    });
  };
  
  return (
    <div className="max-w-2xl mx-auto pt-8 pb-16 animate-fade-in">
      <Card className="shadow-md border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Nutrition Profile</CardTitle>
          <CardDescription>
            Let's gather some information to personalize your nutrition plan
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age: {formData.age}
                  </label>
                  <Slider
                    id="age"
                    min={18}
                    max={90}
                    step={1}
                    value={[formData.age]}
                    onValueChange={values => setFormData(prev => ({ ...prev, age: values[0] }))}
                    className="py-4"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={value => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-medium">Body Composition & Activity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium">
                      Weight (kg): {formData.weight}
                    </label>
                    <Slider
                      id="weight"
                      min={40}
                      max={150}
                      step={1}
                      value={[formData.weight]}
                      onValueChange={values => setFormData(prev => ({ ...prev, weight: values[0] }))}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="height" className="text-sm font-medium">
                      Height (cm): {formData.height}
                    </label>
                    <Slider
                      id="height"
                      min={140}
                      max={220}
                      step={1}
                      value={[formData.height]}
                      onValueChange={values => setFormData(prev => ({ ...prev, height: values[0] }))}
                      className="py-4"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="activityLevel" className="text-sm font-medium">
                    Activity Level
                  </label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={value => handleSelectChange("activityLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (office job, little exercise)</SelectItem>
                      <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very active">Very Active (hard daily exercise & physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="goal" className="text-sm font-medium">
                    Your Goal
                  </label>
                  <Select
                    value={formData.goal}
                    onValueChange={value => handleSelectChange("goal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-medium">Cultural & Dietary Preferences</h3>
                
                <div className="space-y-2">
                  <label htmlFor="nationality" className="text-sm font-medium">
                    Nationality or Cultural Background
                  </label>
                  <Input
                    id="nationality"
                    name="nationality"
                    placeholder="e.g., Indian, Italian, Mexican, etc."
                    value={formData.nationality}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us suggest culturally relevant food options
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Dietary Preferences
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryOptions.map(option => (
                      <Badge
                        key={option}
                        variant={formData.dietaryPreferences.includes(option) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSelectDietaryPreference(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="customPreference" className="text-sm font-medium">
                    Add Custom Dietary Preference
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="customPreference"
                      name="customPreference"
                      placeholder="e.g., Low-sodium, No spicy food"
                      value={formData.customPreference}
                      onChange={handleInputChange}
                    />
                    <Button type="button" variant="outline" onClick={handleAddDietaryPreference}>
                      Add
                    </Button>
                  </div>
                </div>
                
                {formData.dietaryPreferences.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Your Selected Preferences:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.dietaryPreferences.map(pref => (
                        <Badge key={pref} className="flex items-center gap-1">
                          {pref}
                          <X
                            size={14}
                            className="cursor-pointer"
                            onClick={() => handleRemovePreference(pref)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Complete Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
