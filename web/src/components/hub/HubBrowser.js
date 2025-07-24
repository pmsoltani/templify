"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHubContext } from "@/contexts/HubContext.js";
import { FilterIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
import Status from "../common/Status";
import HubTemplateCard from "./HubTemplateCard";

const CATEGORIES = [
  // { value: "", label: "All Categories" },
  { value: "invoice", label: "Invoice" },
  { value: "letter", label: "Letter" },
  { value: "certificate", label: "Certificate" },
  { value: "report", label: "Report" },
  { value: "contract", label: "Contract" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];

export default function HubBrowser() {
  const { hubTemplates, isHubTemplatesLoading, loadHubTemplates } = useHubContext();

  const [filters, setFilters] = useState({ category: "", featured: false, search: "" });
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    loadHubTemplates();
  }, [loadHubTemplates]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Apply filters to API call
    const apiFilters = {
      category: newFilters.category || undefined,
      featured: newFilters.featured || undefined,
    };

    loadHubTemplates(apiFilters);
  };

  const handleSearch = () => setFilters((prev) => ({ ...prev, search: searchInput }));
  const handleRefresh = () => loadHubTemplates(filters);
  const handleKeyPress = (e) => e.key === "Enter" && handleSearch();

  // Filter templates locally for search
  const filteredTemplates = hubTemplates.filter((template) => {
    if (!filters.search) return true;

    const searchLower = filters.search.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.description?.toLowerCase().includes(searchLower) ||
      template.category?.toLowerCase().includes(searchLower) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Hub</h1>
        <p className="text-gray-600">
          Discover and import professional templates created by the community
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured Filter */}
          <Button
            variant={filters.featured ? "default" : "outline"}
            onClick={() => handleFilterChange("featured", !filters.featured)}
            className="w-full lg:w-auto"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Featured
          </Button>

          {/* Search & Refresh Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1 lg:flex-initial">
              Search
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isHubTemplatesLoading}
            >
              {isHubTemplatesLoading ? (
                <Spinner variant="outline" />
              ) : (
                <RefreshCwIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isHubTemplatesLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Status variant="loading" title="Loading templates..." />
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {hubTemplates.length === 0 ? (
              <Status
                variant="empty"
                title="No templates yet"
                message="Be the first to share a template with the community!"
              />
            ) : (
              <Status
                variant="empty"
                title="No templates found"
                message="Try adjusting your search or filters"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <HubTemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isHubTemplatesLoading && filteredTemplates.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredTemplates.length} of {hubTemplates.length} templates
        </div>
      )}
    </div>
  );
}
