export interface CropStage {
  label: string;
  months: number; // threshold at which this stage begins
}

export interface CropConfig {
  key: string;
  label: string;
  emoji: string;
  varieties: string[];
  defaultVariety: string;
  spacingOptions: string[];
  defaultSpacing: string;
  plantUnitLabel: string;
  plantUnitPlaceholder: string;
  cycleMonths: number;
  stages: CropStage[];
  taskCount: number;
}

export const CROPS: Record<string, CropConfig> = {
  plantain: {
    key: "plantain",
    label: "Plantain",
    emoji: "🍌",
    varieties: ["Agbagba", "False Horn", "French", "PITA Hybrid", "Other"],
    defaultVariety: "Agbagba",
    spacingOptions: ["3m x 2m", "2.5m x 2.5m", "3m x 3m"],
    defaultSpacing: "3m x 2m",
    plantUnitLabel: "Number of Suckers",
    plantUnitPlaceholder: "680",
    cycleMonths: 15,
    stages: [
      { label: "Establishment", months: 0 },
      { label: "Early Vegetative", months: 2 },
      { label: "Rapid Growth", months: 4 },
      { label: "Pre-Flowering", months: 6 },
      { label: "Flowering", months: 8 },
      { label: "Bunch Dev.", months: 10 },
      { label: "Harvest Ready", months: 12 },
    ],
    taskCount: 22,
  },
  maize: {
    key: "maize",
    label: "Maize",
    emoji: "🌽",
    varieties: ["Oba Super 2", "Sammaz 15", "Sammaz 52", "Ife Hybrid-6", "Other"],
    defaultVariety: "Oba Super 2",
    spacingOptions: ["75cm x 25cm", "75cm x 50cm", "90cm x 30cm"],
    defaultSpacing: "75cm x 25cm",
    plantUnitLabel: "Number of Stands",
    plantUnitPlaceholder: "2000",
    cycleMonths: 4,
    stages: [
      { label: "Establishment", months: 0 },
      { label: "Vegetative", months: 0.75 },
      { label: "Tasseling/Silking", months: 2 },
      { label: "Grain Filling", months: 2.5 },
      { label: "Harvest Ready", months: 3.5 },
    ],
    taskCount: 14,
  },
  sweet_potato: {
    key: "sweet_potato",
    label: "Sweet Potato",
    emoji: "🍠",
    varieties: ["TIS 87/0087", "TIS 8164", "Ex-Igbariam", "Other"],
    defaultVariety: "TIS 87/0087",
    spacingOptions: ["1m x 30cm", "90cm x 30cm"],
    defaultSpacing: "1m x 30cm",
    plantUnitLabel: "Number of Vine Cuttings",
    plantUnitPlaceholder: "3000",
    cycleMonths: 4,
    stages: [
      { label: "Establishment", months: 0 },
      { label: "Vine Development", months: 0.75 },
      { label: "Tuber Initiation", months: 2 },
      { label: "Tuber Bulking", months: 2.5 },
      { label: "Harvest Ready", months: 3.5 },
    ],
    taskCount: 13,
  },
  cassava: {
    key: "cassava",
    label: "Cassava",
    emoji: "🥔",
    varieties: ["TME 419", "TMS 30572", "TMS 4(2)1425", "NR8082", "Other"],
    defaultVariety: "TME 419",
    spacingOptions: ["1m x 1m", "1m x 80cm"],
    defaultSpacing: "1m x 1m",
    plantUnitLabel: "Number of Stem Cuttings",
    plantUnitPlaceholder: "2500",
    cycleMonths: 11,
    stages: [
      { label: "Establishment", months: 0 },
      { label: "Vegetative Growth", months: 1 },
      { label: "Canopy Closure", months: 3 },
      { label: "Root Bulking", months: 5 },
      { label: "Harvest Ready", months: 8 },
    ],
    taskCount: 16,
  },
  cocoyam: {
    key: "cocoyam",
    label: "Cocoyam",
    emoji: "🍃",
    varieties: ["White Cocoyam (Ile-Ile)", "Yellow Cocoyam", "Tannia (Ede Ocumo)", "Other"],
    defaultVariety: "White Cocoyam (Ile-Ile)",
    spacingOptions: ["1m x 1m", "90cm x 60cm"],
    defaultSpacing: "1m x 1m",
    plantUnitLabel: "Number of Cormels/Setts",
    plantUnitPlaceholder: "2500",
    cycleMonths: 10,
    stages: [
      { label: "Establishment", months: 0 },
      { label: "Vegetative Growth", months: 1 },
      { label: "Corm Initiation", months: 3 },
      { label: "Corm Bulking", months: 5 },
      { label: "Harvest Ready", months: 8 },
    ],
    taskCount: 15,
  },
};

export const CROP_LIST = Object.values(CROPS);

export function getCrop(cropType?: string | null): CropConfig {
  return (cropType && CROPS[cropType]) || CROPS.plantain;
}

// Terms for the harvest-recording UI, which otherwise defaults to plantain "bunch" language.
export const HARVEST_UNIT_LABELS: Record<string, { unit: string; unitPlural: string }> = {
  plantain: { unit: "Bunch", unitPlural: "Bunches" },
  maize: { unit: "Bag", unitPlural: "Bags" },
  sweet_potato: { unit: "Basket", unitPlural: "Baskets" },
  cassava: { unit: "Bag", unitPlural: "Bags" },
  cocoyam: { unit: "Bag", unitPlural: "Bags" },
};

export function getHarvestUnit(cropType?: string | null) {
  return (cropType && HARVEST_UNIT_LABELS[cropType]) || HARVEST_UNIT_LABELS.plantain;
}
