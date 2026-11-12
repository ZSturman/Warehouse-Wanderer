import type { Warehouse, WarehouseFormat, WarehouseService } from "../types";

/**
 * Local development dataset.
 *
 * Costco does not publish a public, keyless bulk-data API for warehouse
 * locations, and this project deliberately does not scrape costco.com. So
 * this file stands in for a production data source: it's a realistic set of
 * warehouse-style entries (real cities, approximate real-world coordinates,
 * plausible-but-fictionalized warehouse numbers) large and varied enough to
 * exercise every feature — search, map clustering, multi-country stats,
 * region-sweep badges, distance math, etc.
 *
 * Swapping this out for a live source later is a matter of writing a new
 * `CostcoLocationProvider` implementation (e.g. backed by a real API or a
 * company-maintained backend) — see `CostcoLocationProvider.ts`. Nothing
 * that consumes `Warehouse[]` needs to change.
 */

const SERVICE_SETS: WarehouseService[][] = [
  ["gas_station", "pharmacy", "optical", "food_court", "tire_center", "photo_center"],
  ["pharmacy", "optical", "food_court", "photo_center"],
  ["gas_station", "food_court", "tire_center", "hearing_aid"],
  ["pharmacy", "optical", "food_court", "liquor"],
];

type Row = [
  id: string,
  number: string,
  name: string,
  address: string,
  city: string,
  region: string,
  countryCode: string,
  country: string,
  latitude: number,
  longitude: number,
  notableLabel?: string,
];

const WAREHOUSE_ROWS: Row[] = [
  ["us-401", "401", "Seattle", "4849 4th Ave S", "Seattle", "Washington", "US", "United States", 47.5707, -122.3316, "The Original — Costco's first-ever warehouse (1983)"],
  ["us-001", "001", "Kirkland", "1216 6th St", "Kirkland", "Washington", "US", "United States", 47.6769, -122.2059, "Namesake of the Kirkland Signature brand"],
  ["us-045", "045", "Spokane", "1620 S Hutchinson Rd", "Spokane", "Washington", "US", "United States", 47.6588, -117.4260],
  ["us-108", "108", "Portland", "4849 SE 82nd Ave", "Portland", "Oregon", "US", "United States", 45.4826, -122.5772],
  ["us-333", "333", "Bend", "2500 NE Hwy 20", "Bend", "Oregon", "US", "United States", 44.0797, -121.2837],
  ["us-402", "402", "Sacramento", "3915 Marconi Ave", "Sacramento", "California", "US", "United States", 38.6013, -121.4053],
  ["us-050", "050", "Novato", "451 W Nova Dr", "Novato", "California", "US", "United States", 38.1074, -122.5697],
  ["us-411", "411", "Los Angeles", "11600 S La Cienega Blvd", "Los Angeles", "California", "US", "United States", 33.9214, -118.3667],
  ["us-081", "081", "San Diego", "1130 Costco Blvd", "San Diego", "California", "US", "United States", 32.7495, -117.1097],
  ["us-089", "089", "Las Vegas", "5300 W Sahara Ave", "Las Vegas", "Nevada", "US", "United States", 36.1447, -115.2231],
  ["us-118", "118", "Reno", "4910 Kietzke Ln", "Reno", "Nevada", "US", "United States", 39.4844, -119.7810],
  ["us-291", "291", "Phoenix", "2350 W Union Hills Dr", "Phoenix", "Arizona", "US", "United States", 33.6851, -112.1067],
  ["us-296", "296", "Tucson", "3701 W Costco Dr", "Tucson", "Arizona", "US", "United States", 32.2793, -111.0217],
  ["us-336", "336", "Salt Lake City", "1818 S 300 W", "Salt Lake City", "Utah", "US", "United States", 40.7376, -111.9018],
  ["us-403", "403", "Denver", "9556 E Arapahoe Rd", "Centennial", "Colorado", "US", "United States", 39.5895, -104.8524],
  ["us-455", "455", "Colorado Springs", "5225 E Platte Ave", "Colorado Springs", "Colorado", "US", "United States", 38.8340, -104.7513],
  ["us-712", "712", "Albuquerque", "6001 San Mateo Blvd NE", "Albuquerque", "New Mexico", "US", "United States", 35.1350, -106.5852],
  ["us-666", "666", "Dallas", "3900 Preston Rd", "Plano", "Texas", "US", "United States", 33.0455, -96.7998],
  ["us-241", "241", "Houston", "11801 Katy Fwy", "Houston", "Texas", "US", "United States", 29.7817, -95.5960],
  ["us-664", "664", "Austin", "9520 N Interstate 35", "Austin", "Texas", "US", "United States", 30.3410, -97.6912],
  ["us-679", "679", "San Antonio", "5611 Bandera Rd", "San Antonio", "Texas", "US", "United States", 29.4938, -98.5877],
  ["us-750", "750", "Oklahoma City", "1345 SW 74th St", "Oklahoma City", "Oklahoma", "US", "United States", 35.3993, -97.5350],
  ["us-269", "269", "Kansas City", "10300 Marion Park Dr", "Lenexa", "Kansas", "US", "United States", 38.9622, -94.7602],
  ["us-278", "278", "St. Louis", "4200 Rusty Rd", "St. Louis", "Missouri", "US", "United States", 38.6612, -90.3652],
  ["us-005", "005", "Minneapolis", "1471 W County Rd B2", "Roseville", "Minnesota", "US", "United States", 45.0189, -93.1567],
  ["us-006", "006", "Chicago (South Loop)", "1430 S Ashland Ave", "Chicago", "Illinois", "US", "United States", 41.8618, -87.6659],
  ["us-032", "032", "Naperville", "2101 W Diehl Rd", "Naperville", "Illinois", "US", "United States", 41.7896, -88.1653],
  ["us-256", "256", "Indianapolis", "5920 W 86th St", "Indianapolis", "Indiana", "US", "United States", 39.9086, -86.2306],
  ["us-273", "273", "Columbus", "1000 Morse Crossing", "Columbus", "Ohio", "US", "United States", 40.0417, -82.9186],
  ["us-274", "274", "Cleveland", "6600 Rockside Rd", "Independence", "Ohio", "US", "United States", 41.3853, -81.6316],
  ["us-347", "347", "Cincinnati", "9285 Fields Ertel Rd", "Cincinnati", "Ohio", "US", "United States", 39.2853, -84.3141],
  ["us-113", "113", "Detroit (Madison Heights)", "32471 Stephenson Hwy", "Madison Heights", "Michigan", "US", "United States", 42.5170, -83.1027],
  ["us-379", "379", "Grand Rapids", "3684 28th St SE", "Grand Rapids", "Michigan", "US", "United States", 42.9297, -85.5570],
  ["us-118b", "118", "Milwaukee", "11800 W Burleigh St", "Wauwatosa", "Wisconsin", "US", "United States", 43.0871, -88.0698],
  ["us-660", "660", "Nashville", "5220 Old Hickory Blvd", "Hermitage", "Tennessee", "US", "United States", 36.1968, -86.6067],
  ["us-661", "661", "Memphis", "6555 Winchester Rd", "Memphis", "Tennessee", "US", "United States", 35.0298, -89.8280],
  ["us-343", "343", "Atlanta (Perimeter)", "6335 Peachtree Dunwoody Rd", "Atlanta", "Georgia", "US", "United States", 33.9224, -84.3499],
  ["us-344", "344", "Charlotte", "9820 Northlake Centre Pkwy", "Charlotte", "North Carolina", "US", "United States", 35.3410, -80.8156],
  ["us-345", "345", "Raleigh", "1051 Old Wake Forest Rd", "Raleigh", "North Carolina", "US", "United States", 35.8290, -78.6320],
  ["us-782", "782", "Richmond", "11500 W Broad St", "Richmond", "Virginia", "US", "United States", 37.6595, -77.6350],
  ["us-783", "783", "Virginia Beach", "3193 Virginia Beach Blvd", "Virginia Beach", "Virginia", "US", "United States", 36.8443, -76.0913],
  ["us-448", "448", "Sterling", "22625 Davis Dr", "Sterling", "Virginia", "US", "United States", 39.0270, -77.3930],
  ["us-283", "283", "Baltimore", "1520 S Caton Ave", "Baltimore", "Maryland", "US", "United States", 39.2701, -76.6613],
  ["us-352", "352", "Philadelphia", "2200 Franklin Mills Cir", "Philadelphia", "Pennsylvania", "US", "United States", 40.0912, -74.9367],
  ["us-353", "353", "Pittsburgh", "2200 Village Center Dr", "Pittsburgh", "Pennsylvania", "US", "United States", 40.4491, -80.0323],
  ["us-114", "114", "Long Island City", "32-50 Vernon Blvd", "New York", "New York", "US", "United States", 40.7573, -73.9490],
  ["us-373", "373", "Melville", "80 Broadhollow Rd", "Melville", "New York", "US", "United States", 40.7834, -73.4176],
  ["us-374", "374", "Albany", "965 New Loudon Rd", "Latham", "New York", "US", "United States", 42.7442, -73.7554],
  ["us-072", "072", "Boston (Dedham)", "685 Providence Hwy", "Dedham", "Massachusetts", "US", "United States", 42.2373, -71.1745],
  ["us-073", "073", "Providence", "155 Hillside Rd", "Cranston", "Rhode Island", "US", "United States", 41.7658, -71.4732],
  ["us-074", "074", "Hartford (Westbury)", "50 Kelly Rd", "New Britain", "Connecticut", "US", "United States", 41.6771, -72.7723],
  ["us-227", "227", "Newark (Union)", "1015 US-22", "Union", "New Jersey", "US", "United States", 40.6790, -74.2820],
  ["us-330", "330", "Miami", "1620 NW 82nd Ave", "Doral", "Florida", "US", "United States", 25.7997, -80.3573],
  ["us-331", "331", "Orlando", "8323 Palm Pkwy", "Orlando", "Florida", "US", "United States", 28.3970, -81.4990],
  ["us-332", "332", "Tampa", "5075 Beverly Palms Dr", "Tampa", "Florida", "US", "United States", 27.9944, -82.4046],
  ["us-762", "762", "Jacksonville", "13801 Old St Augustine Rd", "Jacksonville", "Florida", "US", "United States", 30.1899, -81.6076],
  ["us-762b", "129", "New Orleans (Harahan)", "3900 Jefferson Hwy", "Harahan", "Louisiana", "US", "United States", 29.9455, -90.1990],
  ["us-476", "476", "Birmingham", "250 Grandview Dr", "Birmingham", "Alabama", "US", "United States", 33.4548, -86.7402],
  ["us-055", "055", "Honolulu (Iwilei)", "525 Alakawa St", "Honolulu", "Hawaii", "US", "United States", 21.3210, -157.8608],
  ["us-660b", "779", "Anchorage", "330 W Dimond Blvd", "Anchorage", "Alaska", "US", "United States", 61.1445, -149.8760],
  ["us-338", "338", "Boise", "7175 Overland Rd", "Boise", "Idaho", "US", "United States", 43.5964, -116.2600],
  ["us-brc-la", "BC01", "Commerce Business Center", "5675 District Blvd", "Commerce", "California", "US", "United States", 33.9950, -118.1590],
  ["us-brc-be", "BC02", "Bellevue Business Center", "1210 124th Ave NE", "Bellevue", "Washington", "US", "United States", 47.6280, -122.1720],
  ["us-brc-ch", "BC03", "Melrose Park Business Center", "1300 W Lake St", "Melrose Park", "Illinois", "US", "United States", 41.9040, -87.8560],

  ["ca-108", "108", "Vancouver (Downtown)", "1055 Expo Blvd", "Vancouver", "British Columbia", "CA", "Canada", 49.2768, -123.1119],
  ["ca-109", "109", "Burnaby", "4500 Still Creek Dr", "Burnaby", "British Columbia", "CA", "Canada", 49.2606, -123.0189],
  ["ca-345", "345", "Calgary", "5150 47th St NE", "Calgary", "Alberta", "CA", "Canada", 51.1030, -114.0180],
  ["ca-346", "346", "Edmonton", "13650 50th St NW", "Edmonton", "Alberta", "CA", "Canada", 53.5730, -113.4270],
  ["ca-447", "447", "Winnipeg", "1795 Sargent Ave", "Winnipeg", "Manitoba", "CA", "Canada", 49.8890, -97.2010],
  ["ca-401", "401", "Toronto (Scarborough)", "1411 Warden Ave", "Toronto", "Ontario", "CA", "Canada", 43.7370, -79.3000],
  ["ca-402", "402", "Ottawa", "1900 Cyrville Rd", "Ottawa", "Ontario", "CA", "Canada", 45.4270, -75.6120],
  ["ca-501", "501", "Montreal (Saint-Laurent)", "1500 Boulevard Le Corbusier", "Montreal", "Quebec", "CA", "Canada", 45.5030, -73.7370],
  ["ca-502", "502", "Quebec City", "2250 Boulevard Le Corbusier", "Quebec City", "Quebec", "CA", "Canada", 46.7910, -71.3220],
  ["ca-601", "601", "Halifax (Dartmouth)", "220 Chain Lake Dr", "Dartmouth", "Nova Scotia", "CA", "Canada", 44.6650, -63.6280],

  ["mx-701", "701", "Ciudad de México (Pedregal)", "Periférico Sur 4690", "Mexico City", "Ciudad de México", "MX", "Mexico", 19.3160, -99.2010],
  ["mx-702", "702", "Guadalajara", "Av. Prolongación Américas 1500", "Guadalajara", "Jalisco", "MX", "Mexico", 20.6980, -103.3820],
  ["mx-703", "703", "Monterrey", "Av. Roble 660", "San Pedro Garza García", "Nuevo León", "MX", "Mexico", 25.6510, -100.3600],

  ["gb-851", "851", "Croydon", "Purley Way", "London", "England", "GB", "United Kingdom", 51.3690, -0.1160],
  ["gb-852", "852", "Trafford Park", "Europa Way", "Manchester", "England", "GB", "United Kingdom", 53.4590, -2.3410],

  ["jp-951", "951", "Makuhari", "3-1-1 Hinode", "Chiba", "Chiba", "JP", "Japan", 35.6470, 140.0350],
  ["jp-952", "952", "Amagasaki", "1-1 Showacho", "Amagasaki", "Hyogo", "JP", "Japan", 34.7160, 135.4260],

  ["kr-961", "961", "Yangjae", "355 Yangjae-daero", "Seoul", "Seoul", "KR", "South Korea", 37.4700, 127.0390],

  ["tw-971", "971", "Neihu", "Sec. 1, Neihu Rd", "Taipei", "Taipei", "TW", "Taiwan", 25.0800, 121.5750],

  ["au-981", "981", "Docklands", "800 Footscray Rd", "Melbourne", "Victoria", "AU", "Australia", -37.8080, 144.9280],
  ["au-982", "982", "Auburn", "5 Duncan St", "Auburn", "New South Wales", "AU", "Australia", -33.8490, 151.0330],

  ["es-991", "991", "Getafe", "Avenida de los Rosales 1", "Getafe", "Madrid", "ES", "Spain", 40.2980, -3.7160],

  ["fr-992", "992", "Villebon-sur-Yvette", "Route de Nozay", "Villebon-sur-Yvette", "Île-de-France", "FR", "France", 48.7010, 2.2270],

  ["is-993", "993", "Garðabær", "Kauptún 3", "Garðabær", "Capital Region", "IS", "Iceland", 64.1010, -21.8760, "Iceland's only warehouse — pump gas without a membership"],

  ["cn-994", "994", "Minhang", "555 Hongmei Rd", "Shanghai", "Shanghai", "CN", "China", 31.1660, 121.3880],
  ["cn-995", "995", "Suzhou", "1 Yangcheng Rd", "Suzhou", "Jiangsu", "CN", "China", 31.3630, 120.6660],
];

function formatFor(id: string): WarehouseFormat {
  return id.startsWith("us-brc") ? "business_center" : "warehouse";
}

function servicesFor(index: number, format: WarehouseFormat): WarehouseService[] {
  if (format === "business_center") return ["business_delivery", "food_court"];
  return SERVICE_SETS[index % SERVICE_SETS.length];
}

export const WAREHOUSES: Warehouse[] = WAREHOUSE_ROWS.map((row, index) => {
  const [id, number, name, address, city, region, countryCode, country, latitude, longitude, notableLabel] = row;
  const format = formatFor(id);
  return {
    id,
    number,
    name,
    address,
    city,
    region,
    countryCode,
    country,
    latitude,
    longitude,
    format,
    services: servicesFor(index, format),
    notableLabel,
  };
});
