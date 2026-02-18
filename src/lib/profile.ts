import { User } from "@prisma/client";

/**
 * Checks if a user's profile is complete.
 * Mandatory fields: Name, Year, Branch, Section, Address, Phone Number.
 */
export function isProfileComplete(user: User): boolean {
    if (!user) return false;
    
    const requiredFields = [
        user.name,
        user.year,
        user.branch,
        user.section,
        user.address,
        user.phoneNumber
    ];

    return requiredFields.every(field => field && field.trim() !== "");
}
