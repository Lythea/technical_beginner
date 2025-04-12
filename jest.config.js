module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // if you're using path aliases like "@/lib/..."
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
