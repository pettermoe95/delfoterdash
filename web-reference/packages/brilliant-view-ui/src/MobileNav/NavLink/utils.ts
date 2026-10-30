// Function that checks if a given path is active and includes parent routes
export function isActive(currentLocation: string, path: string, exact = false) {
    if (exact) {
        return path === currentLocation;
    } else {
        return currentLocation.startsWith(path);
    }
}
