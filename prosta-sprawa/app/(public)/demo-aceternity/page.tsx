"use client";
import SignupFormDemo from "@/components/ui/signup-form-demo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AceternityDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Aceternity Components Demo
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Piękne komponenty z animacjami i efektami hover
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signup Form Demo */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
              Signup Form
            </h2>
            <SignupFormDemo />
          </div>

          {/* Individual Components Demo */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
              Individual Components
            </h2>

            <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-6 dark:bg-black">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="demo-input">Animated Input</Label>
                  <Input id="demo-input" placeholder="Hover to see animation" type="text" />
                </div>

                <div>
                  <Label htmlFor="demo-select">Animated Select</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz opcję" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Opcja 1</SelectItem>
                      <SelectItem value="option2">Opcja 2</SelectItem>
                      <SelectItem value="option3">Opcja 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="demo-email">Email Input</Label>
                  <Input id="demo-email" placeholder="your@email.com" type="email" />
                </div>

                <div>
                  <Label htmlFor="demo-password">Password Input</Label>
                  <Input id="demo-password" placeholder="••••••••" type="password" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
