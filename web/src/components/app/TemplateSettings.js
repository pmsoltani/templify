"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { SaveIcon, SettingsIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

const initialSettings = {
  format: "A4",
  orientation: "portrait",
  margin: {
    top: "20mm",
    right: "20mm",
    bottom: "20mm",
    left: "20mm",
  },
  printBackground: true,
  displayHeaderFooter: false,
  headerTemplate: "",
  footerTemplate: "",
};

export default function TemplateSettings({ templateId, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient(`/api/templates/${templateId}`);
      const settingsDb = data.data.template.settings || {};
      if (settingsDb && Object.keys(settingsDb).length > 0) setSettings(settingsDb);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  const saveSettings = useCallback(
    async (newSettings) => {
      setIsSaving(true);
      try {
        const data = await apiClient(`/api/templates/${templateId}/settings`, {
          method: "PUT",
          body: { settings: newSettings },
        });
        setSettings(data.data.template.settings);
        onSettingsChange?.(data.data.template.settings); // Notify parent about change
      } catch (err) {
        console.error("Failed to save settings:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [templateId, onSettingsChange]
  );

  useEffect(() => {
    if (templateId) loadSettings();
  }, [templateId, loadSettings]);

  const handleSettingChange = (key, value) => {
    const margin = settings?.margin || initialSettings.margin;
    const marginSide = key.startsWith("margin-") ? key.split("-")[1] : null;
    if (marginSide) margin[marginSide] = value;

    const newSettings = { ...(settings ? settings : initialSettings), margin };
    if (!marginSide) newSettings[key] = value;

    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    await saveSettings(settings);
    setHasUnsavedChanges(false);
  };

  const pageFormats = [
    { value: "A5", label: "A5" },
    { value: "A4", label: "A4" },
    { value: "A3", label: "A3" },
    { value: "A2", label: "A2" },
    { value: "A1", label: "A1" },
    { value: "A0", label: "A0" },
    { value: "Letter", label: "Letter" },
    { value: "Legal", label: "Legal" },
  ];

  const orientations = [
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
          {hasUnsavedChanges && (
            <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
              *
            </span>
          )}
          {isSaving && (
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-900" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px] p-4">
        <SheetHeader className="p-0">
          <SheetTitle>PDF Settings</SheetTitle>
          <SheetDescription>
            Configure how your template will be rendered as a PDF.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Page Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Page Format</Label>
            <Select
              value={settings?.format || "A4"}
              onValueChange={(value) => handleSettingChange("format", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {pageFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <Label htmlFor="orientation">Orientation</Label>
            <Select
              value={settings?.orientation || "portrait"}
              onValueChange={(value) => handleSettingChange("orientation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                {orientations.map((orientation) => (
                  <SelectItem key={orientation.value} value={orientation.value}>
                    {orientation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Margins */}
          <div className="space-y-3">
            <Label>Margins</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="margin-top" className="text-sm">
                  Top
                </Label>
                <Input
                  id="margin-top"
                  value={settings?.margin?.top || "20mm"}
                  onChange={(e) => handleSettingChange("margin-top", e.target.value)}
                  placeholder="20mm"
                />
              </div>
              <div>
                <Label htmlFor="margin-right" className="text-sm">
                  Right
                </Label>
                <Input
                  id="margin-right"
                  value={settings?.margin?.right || "20mm"}
                  onChange={(e) => handleSettingChange("margin-right", e.target.value)}
                  placeholder="20mm"
                />
              </div>
              <div>
                <Label htmlFor="margin-bottom" className="text-sm">
                  Bottom
                </Label>
                <Input
                  id="margin-bottom"
                  value={settings?.margin?.bottom || "20mm"}
                  onChange={(e) => handleSettingChange("margin-bottom", e.target.value)}
                  placeholder="20mm"
                />
              </div>
              <div>
                <Label htmlFor="margin-left" className="text-sm">
                  Left
                </Label>
                <Input
                  id="margin-left"
                  value={settings?.margin?.left || "20mm"}
                  onChange={(e) => handleSettingChange("margin-left", e.target.value)}
                  placeholder="20mm"
                />
              </div>
            </div>
          </div>

          {/* Background graphics */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="print-background"
                checked={settings?.printBackground || false}
                onCheckedChange={(checked) =>
                  handleSettingChange("printBackground", checked)
                }
              />
              <Label htmlFor="print-background">Background graphics</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Include background colors and images in the PDF.
            </p>
          </div>

          {/* Header/Footer */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="header-footer"
                checked={settings?.displayHeaderFooter || false}
                onCheckedChange={(checked) =>
                  handleSettingChange("displayHeaderFooter", checked)
                }
              />
              <Label htmlFor="header-footer">Display Header/Footer</Label>
            </div>

            {settings?.displayHeaderFooter && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <div>
                  <Label htmlFor="header-template" className="text-sm">
                    Header Template
                  </Label>
                  <Textarea
                    id="header-template"
                    value={settings?.headerTemplate || ""}
                    onChange={(e) =>
                      handleSettingChange("headerTemplate", e.target.value)
                    }
                    placeholder={`<span class="title" style="font-size: 8px;"></span>`}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HTML template for page headers
                  </p>
                </div>
                <div>
                  <Label htmlFor="footer-template" className="text-sm">
                    Footer Template
                  </Label>
                  <Textarea
                    id="footer-template"
                    value={settings?.footerTemplate || ""}
                    onChange={(e) =>
                      handleSettingChange("footerTemplate", e.target.value)
                    }
                    placeholder={`<span class="pageNumber" style="font-size: 8px;"></span>`}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HTML template for page footers
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
