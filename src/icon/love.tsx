"use client";

import React from "react";
import * as Icons from "lucide-react";

export const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Compass;
  return <IconComponent className={className} />;
};
