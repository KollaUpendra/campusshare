/**
 * @file utils.ts
 * @description Shared utility functions for the CampusShare platform.
 * @module Lib/Utils
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge Tailwind CSS class names.
 * Combines `clsx` (conditional class merging) with `twMerge` (de-duplication).
 * 
 * @param {...ClassValue[]} inputs - Any number of class values.
 * @returns {string} The merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
