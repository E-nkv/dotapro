import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

// Setup paths
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Output to public directory so Vite can serve files
const OUTPUT_DIR = path.resolve(__dirname, "../assets/static_data")

const URLS = {
    heroes: "https://raw.githubusercontent.com/odota/dotaconstants/master/build/heroes.json",
    heroLore: "https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_lore.json", // Added
    itemIds: "https://raw.githubusercontent.com/odota/dotaconstants/master/build/item_ids.json",
    items: "https://raw.githubusercontent.com/odota/dotaconstants/master/build/items.json",
}

async function fetchData(url) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    return response.json()
}

async function generate() {
    console.log("⬇️  Fetching Dota 2 constants from OpenDota GitHub...")
    // Fetch all data sources in parallel
    const [heroesRaw, heroLoreRaw, itemIdsRaw, itemsRaw] = await Promise.all([
        fetchData(URLS.heroes),
        fetchData(URLS.heroLore),
        fetchData(URLS.itemIds),
        fetchData(URLS.items),
    ])

    console.log("⚙️  Processing Heroes...")
    const heroes = {}
    for (const hero of Object.values(heroesRaw)) {
        // The lore JSON uses the short name (e.g. "antimage") as the key
        const shortName = hero.name.replace("npc_dota_hero_", "")

        heroes[hero.id] = {
            id: hero.id,
            name: shortName,
            displayName: hero.localized_name,
            lore: heroLoreRaw[shortName] || null, // Map the lore here
        }
    }

    console.log("⚙️  Processing Items...")
    // Initialize with empty item slot
    const items = {
        0: { id: 0, name: "item_empty", displayName: "Empty" },
    }
    const neutralItems = {}

    for (const [idStr, itemName] of Object.entries(itemIdsRaw)) {
        const id = parseInt(idStr, 10)
        const itemData = itemsRaw[itemName]

        if (!itemData) continue

        const itemObj = {
            id,
            name: itemName,
            displayName: itemData.dname || itemName,
            cost: itemData.cost || 0,
            lore: itemData.lore || "",
            mc: itemData.mc || false,
            hc: itemData.hc || false,
            cd: itemData.cd || false,
            abilities: itemData.abilities || [],
            attrib: itemData.attrib || [],
            components: itemData.components || null,
            tier: itemData.tier || null,
        }

        // OpenDota marks neutral items with a numeric "tier" property
        if (itemData.tier !== undefined && itemData.tier !== null) {
            neutralItems[id] = itemObj
        } else {
            items[id] = itemObj
        }
    }

    console.log("📝 Writing JSON files...")
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // Write separate JSON files
    await Promise.all([
        fs.writeFile(path.join(OUTPUT_DIR, "heroes.json"), JSON.stringify(heroes, null, 2), "utf-8"),
        fs.writeFile(path.join(OUTPUT_DIR, "items.json"), JSON.stringify(items, null, 2), "utf-8"),
        fs.writeFile(path.join(OUTPUT_DIR, "neutrals.json"), JSON.stringify(neutralItems, null, 2), "utf-8"),
    ])

    console.log(`✅ Successfully generated static data files in ${OUTPUT_DIR}`)
    console.log("   - heroes.json")
    console.log("   - items.json")
    console.log("   - neutrals.json")
}

generate().catch(err => {
    console.error("❌ Error generating constants:", err)
    process.exit(1)
})
