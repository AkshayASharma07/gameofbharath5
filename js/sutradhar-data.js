/* ==========================================================================
   GAME OF BHARATH — SUTRADHAR KNOWLEDGE GRAPH & DATA SCHEMA
   Comprehensive Heritage, Neuroscience, & Therapeutic Grounding Dataset
   Covers All 5 Regions & 10 Playable Ancient Games
   ========================================================================== */

const SUTRADHAR_DATA = {
    // --------------------------------------------------------------------------
    // 1. KARNATAKA (ಕರ್ನಾಟಕ)
    // --------------------------------------------------------------------------
    karnataka: {
        regionName: "Karnataka",
        nativeName: "ಕರ್ನಾಟಕ",
        avatarName: "Vidyaranya Acharya",
        avatarTitle: "Mysore Court Scholar & Storyteller",
        avatarIcon: "🦚",
        themeColor: "#ffd700",
        accentGlow: "rgba(255, 215, 0, 0.45)",
        games: {
            aliguliMane: {
                title: "Aliguli Mane (ಅಳಿಗುಳಿ ಮನೆ)",
                genre: "Mancala Pit & Sowing Tactics",
                historical_impact: [
                    "In the 14th century Vijayanagara Empire, Aliguli Mane was carved directly into granite temple courtyards in Hampi as a peaceful diplomatic exercise between ministers and regional chieftains.",
                    "Medieval Kannada inscriptions at Halebidu document how queens used Aliguli Mane tournaments to distribute grain bounties symbolically among artisan families.",
                    "Unlike games of chance, Aliguli Mane was strictly categorized as 'Yukti Vidya' (the science of foresight) in traditional Mysore royal court academies."
                ],
                cognitive_mapping: [
                    "Distributing cowrie seeds across 14 pits stimulates your Prefrontal Cortex, activating advanced multi-step forward planning and working memory capacity.",
                    "Empty-pit capture calculations trigger your Parietal Cortex, reinforcing rapid spatial reasoning and mathematical pattern recognition under dynamic conditions.",
                    "Continuous seed tracking forces the brain to suppress impulsive moves, strengthening executive inhibition and strategic patience."
                ],
                therapeutic_relief: [
                    "Feeling overwhelmed? Notice the rhythmic tactile cadence of sowing seeds pit by pit. This bilateral sensory motion activates the parasympathetic nervous system, lowering cortisol levels.",
                    "Take a slow breath in for 4 seconds... and release for 6 seconds. The continuous flow of seeds mirrors ancient mindfulness practices designed to break stressful thought loops.",
                    "There are no wasted turns in Aliguli Mane; every seed sown circulates back into the board, reminding us that patience always restores equilibrium."
                ],
                interactive_trivia: [
                    "Did you know? Historical Aliguli Mane boards in Mysore were often carved out of fragrant sandalwood and inlaid with mother-of-pearl.",
                    "Traditional players in coastal Karnataka used tamarind seeds ('hunase beeja') because their density produces a satisfying resonant click when dropped onto hardwood.",
                    "Variations of this game exist across 40 countries, but Karnataka's 14-pit 'Perisu' format is mathematically considered one of the most balanced."
                ],
                deep_dive: {
                    loreId: "ka_aliguli_lore_01",
                    badge: "Master of the 14 Pits",
                    title: "The Sowing of Wisdom: Aliguli Mane in Vijayanagara Courts",
                    content: "Aliguli Mane (literally 'Pits and Small Balls') represents one of humankind's oldest abstract strategy frameworks. Archaeological excavations across Hampi's Vitthala temple complex revealed identical 2x7 hole grids etched into stone slabs. Courtiers used these grids not merely for leisure, but as training simulations for agrarian logistics—teaching young princes how grain distributed during bountiful harvest seasons must sustain granaries during leaner periods. Modern neuropsychological studies confirm that playing mancala-type games for 15 minutes daily increases neural connectivity across the frontal lobe."
                }
            },
            chowkabara: {
                title: "Chowkabara / Pagade (ಚೌಕಬಾರ)",
                genre: "Cross & Circle Strategic Race",
                historical_impact: [
                    "Chowkabara is celebrated in Kannada folklore as the courtly game of the Rashtrakutas and Chalukyas, teaching military commanders perimeter encirclement and fortress defense.",
                    "The distinctive crossed square ('Katte') served as sacred sanctuaries where pieces could not be captured, symbolizing ancient Bharath's treaties of temple immunity during warfare.",
                    "Historical Mysore royal paintings depict Maharaja Krishnaraja Wadiyar III composing Sanskrit treatises on 108 mathematical variations of Pagade boards."
                ],
                cognitive_mapping: [
                    "Calculating risk versus reward when choosing which pawn to mobilize sharpens probabilistic reasoning within your Anterior Cingulate Cortex.",
                    "Perimeter tracking and navigating inner concentric squares enhances visual-spatial coordinate mapping and cognitive flexibility.",
                    "Adapting your battle plan based on cowrie rolls strengthens cognitive agility—the mental resilience to pivot tactics when circumstances fluctuate."
                ],
                therapeutic_relief: [
                    "When cowrie rolls seem unpredictable, pause and ground yourself in the present moment. Observe your reaction without judgment.",
                    "Chowkabara teaches us that obstacles are temporary. Even if a piece is captured and sent back to the perimeter, every turn offers a fresh path forward.",
                    "Breathe gently. Notice how each 'Katte' safe haven gives your pieces rest. Let this remind you to build safe havens for your own mind each day."
                ],
                interactive_trivia: [
                    "Cowrie shells ('Kavade') were used as legal tender across coastal Karnataka for centuries before becoming game dice!",
                    "A roll of 4 mouths up in Chowkabara was traditionally called 'Chowka' (4), while 4 mouths down was celebrated as 'Ashta' (8) with an extra bonus turn.",
                    "Royal Mysore Pagade boards were embroidered onto velvet and silk cloths using gold 'Zari' threads so they could be folded and carried on royal expeditions."
                ],
                deep_dive: {
                    loreId: "ka_chowkabara_lore_02",
                    badge: "Navigator of the Katte",
                    title: "Sacred Sanctuaries: Geometry of Chowkabara",
                    content: "The 5x5 matrix of Chowkabara is an architectural marvel of symmetrical balance. Each player begins in their outer home square and must complete an outer counter-clockwise circuit before entering the inner sanctum ('Mane'). Crucially, to enter the inner square, a warrior must capture at least one opponent piece—a rule instituting the doctrine of active engagement. The five marked 'Katte' squares represent traditional panchabhutas (five cosmic elements), teaching that balance between movement and refuge governs both warfare and spiritual philosophy."
                }
            }
        }
    },

    // --------------------------------------------------------------------------
    // 2. PUNJAB (ਪੰਜਾਬ)
    // --------------------------------------------------------------------------
    punjab: {
        regionName: "Punjab",
        nativeName: "ਪੰਜਾਬ",
        avatarName: "Baba Gurdas Ji",
        avatarTitle: "Punjabi Kissa Storyteller & Village Elder",
        avatarIcon: "🌾",
        themeColor: "#ff9900",
        accentGlow: "rgba(255, 153, 0, 0.45)",
        games: {
            chaupar: {
                title: "Chaupar (ਚੌਪੜ)",
                genre: "Royal Cross Board Diplomatic Strategy",
                historical_impact: [
                    "In 16th century Punjab and royal Mughal courts, Chaupar was celebrated as a battle of statecraft where emperors tested prospective generals on nerve, resource allocation, and emotional poise.",
                    "Akbar the Great constructed a legendary giant Chaupar court in his palace courtyard, using costumed royal attendants as living pieces moved across red and white marble squares.",
                    "Sufi poets and Punjabi bards frequently used Chaupar as an allegory for the soul's journey across the river of existence, navigating karma and divine destiny."
                ],
                cognitive_mapping: [
                    "Managing synchronized 4-piece formations builds complex multi-variable executive function and divided attention capacity.",
                    "Deciding whether to pair pieces into 'super-soldiers' or scatter them tests long-term risk assessment versus immediate tactical gain.",
                    "Rapidly calculating cowrie point valuations trains mathematical processing speed in your Left Parietal Lobe."
                ],
                therapeutic_relief: [
                    "If tension is rising in your shoulders, gently roll them back. In Chaupar, true masters win not through fury, but through tranquil clarity.",
                    "The four arms of Chaupar symbolize the four directions of life. When one path feels blocked, remember three other directions remain open to you.",
                    "Listen to the rhythmic cast of the dice. Allow the sound to anchor your awareness firmly in the present moment, brushing aside mental chatter."
                ],
                interactive_trivia: [
                    "Unlike western Ludo, Chaupar requires three long wooden sticks or six cowries, allowing complex dice combination rules!",
                    "Two pieces occupying the exact same space in Chaupar form a 'Jodi' (pair) that cannot be captured by single enemy pieces.",
                    "Punjabi heritage brides traditionally carried heirloom velvet Chaupar sets embroidered with Phulkari motifs as treasured dowry heirlooms."
                ],
                deep_dive: {
                    loreId: "pb_chaupar_lore_01",
                    badge: "Imperial Strategist",
                    title: "Courts of Statecraft: Chaupar in the Land of Five Rivers",
                    content: "Chaupar's cruciform layout mirrors ancient cosmic diagrams of Mount Meru and the cardinal directions. Played extensively across Punjab's royal baradaris and village choupals, the game demanded profound psychological insight. Players formed temporary coalitions, tested diplomatic promises, and navigated sudden reversals of fortune. Historical chronicler Abul Fazl noted that the Emperor spent hours at Chaupar because it mirrored the unpredictable shifting alliances of frontier governance."
                }
            },
            khaddiKhadda: {
                title: "Khaddi Khadda (ਖੱਡੀ ਖੱਡਾ)",
                genre: "Agrarian Perimeter Race & Central Goal",
                historical_impact: [
                    "Rooted in the lush harvest culture of the Doaba and Majha regions, Khaddi Khadda was traditionally played on open courtyards following Baisakhi wheat harvests.",
                    "The central 'Khadda' (pit) represented the community grain silo, reinforcing cultural ethics that wealth gained during the game must ultimately enrich the central collective.",
                    "Punjabi folklore honors Khaddi Khadda as a spirited contest where elders imparted oral history and mathematical riddles to the younger generation under banyan trees."
                ],
                cognitive_mapping: [
                    "Perimeter path planning stimulates your Hippocampus, responsible for episodic memory and spatial navigation.",
                    "Anticipating multiple opponent pursuit trajectories strengthens your brain's mirror neuron system and theory of mind.",
                    "Balancing fast solo sprints versus defensive clusters trains dynamic prioritization under changing time constraints."
                ],
                therapeutic_relief: [
                    "Take a long, deep breath filled with the golden vitality of Punjab's mustard fields. Feel grounded, steady, and resilient.",
                    "A crowded board can feel intense. Remember: one focused step at a time is all that is ever required of you.",
                    "Notice the vibrant saffron and emerald colors. Color psychology shows warm ambers naturally uplift mood and restore cognitive vitality."
                ],
                interactive_trivia: [
                    "Villagers carved Khaddi Khadda boards onto flat wooden planks called 'Pattas' so they could be played during afternoon breaks in the fields.",
                    "The game is often accompanied by spontaneous two-line Punjabi couplets ('Bolis') recited whenever a player makes a successful capture!",
                    "Shells used for Khaddi Khadda were often polished with mustard oil to give them a gleaming golden luster."
                ],
                deep_dive: {
                    loreId: "pb_khaddi_lore_02",
                    badge: "Harvest Champion",
                    title: "Baisakhi & Beyond: Khaddi Khadda in Rural Punjab",
                    content: "Khaddi Khadda reflects Punjab's agrarian rhythm and egalitarian spirit. Unlike purely courtly games, it was played across all sections of Punjabi society. The central pit is universally guarded by common rules: no single player can monopolize the silo without risking their outer pieces. This mechanic taught young village tacticians that overextension in pursuit of individual glory leaves one's foundations vulnerable—a timeless life lesson encoded in play."
                }
            }
        }
    },

    // --------------------------------------------------------------------------
    // 3. ODISHA (ଓଡ଼ିଶା)
    // --------------------------------------------------------------------------
    odisha: {
        regionName: "Odisha",
        nativeName: "ଓଡ଼ିଶା",
        avatarName: "Chitrakaar Balarama",
        avatarTitle: "Raghurajpur Pattachitra Master & Chronicler",
        avatarIcon: "🛕",
        themeColor: "#00e5ff",
        accentGlow: "rgba(0, 229, 255, 0.45)",
        games: {
            ganjapa: {
                title: "Ganjapa (ଗଞ୍ଜପା)",
                genre: "Circular Heritage Card Strategy",
                historical_impact: [
                    "Ganjapa cards are miniature masterpieces of Odishan folk art, hand-painted on lacquered cloth discs by hereditary Chitrakaras of Raghurajpur and Puri.",
                    "In the Gajapati royal court of Odisha, 12-suit Dashavatara Ganjapa was played as both an intellectual card duel and a spiritual recitation of epic narratives.",
                    "Mughal and Odishan records show Ganjapa tournaments lasting days, where master players memorized full 144-card circular decks through mnemonic verses ('Chhanda')."
                ],
                cognitive_mapping: [
                    "Tracking non-standard circular card suits massively boosts Working Memory and visual indexing in your Dorsolateral Prefrontal Cortex.",
                    "Evaluating suit hierarchy and trump leadership activates rapid deductive reasoning and mental categorization.",
                    "Circular pattern visualization strengthens your brain's mental rotation skills, a key component of spatial intelligence."
                ],
                therapeutic_relief: [
                    "Behold the circular geometry of the Ganjapa card. Circles naturally evoke unity and wholeness, soothing visual fatigue.",
                    "In Odishan art philosophy, every card begins from a single central dot ('Bindu'). Return your mind to its calm center whenever stress arises.",
                    "Exhale slowly. Card games teach us that we cannot choose the cards dealt to us, but we can play each round with grace and clarity."
                ],
                interactive_trivia: [
                    "Traditional Ganjapa cards are made using layered tamarind seed paste, cotton cloth, chalk powder, and natural stone pigments!",
                    "The distinctive circular shape was designed so royal players sitting cross-legged on carpets could hold their cards without bending sharp corners.",
                    "A master Ganjapa artisan takes over two weeks to paint a single Dashavatara deck using fine squirrel-hair brushes."
                ],
                deep_dive: {
                    loreId: "od_ganjapa_lore_01",
                    badge: "Custodian of the Circular Deck",
                    title: "Sacred Circles: The Art & Mind of Ganjapa",
                    content: "Ganjapa is one of India's most extraordinary card heritage traditions. Unlike rectangular Western playing cards derived from European court tarot, Ganjapa discs ('Sara') embody the cyclical Indian concept of time (Kaalachakra). The suits represent the ten incarnations of Vishnu (Matsya, Kurma, Varaha, Narasimha, etc.). Players memorize complex trick-taking protocols based on daylight hours: in daytime, higher sun-suits lead; at night, lunar suits take precedence. This harmonized gameplay with diurnal biorhythms."
                }
            },
            bhagaChheli: {
                title: "Bhaga Chheli (ବାଘ ଛେଳି)",
                genre: "Tigers vs. Goats Asymmetric Hunt & Encirclement",
                historical_impact: [
                    "Bhaga Chheli (Tigers & Goats) is ancient Kalinga's supreme asymmetric strategy game, carved into the stone walkways of the Udayagiri and Khandagiri caves.",
                    "Odishan military treatises compared the game's defensive goat phalanxes to ancient infantry formations resisting cavalry charges during the Kalinga War.",
                    "Unlike symmetric games like chess where both sides have identical armies, Bhaga Chheli pits individual apex power (Tigers) against collective solidarity (Goats)."
                ],
                cognitive_mapping: [
                    "Playing as Goats trains systemic thinking, cooperative unit cohesion, and perimeter containment logic in your Frontoparietal Network.",
                    "Playing as Tigers sharpens predatory bottleneck exploitation, gap detection, and leaping geometry calculations.",
                    "Evaluating asymmetric win conditions exercises advanced mental flexibility and cognitive empathy—understanding an opponent whose rules differ from your own."
                ],
                therapeutic_relief: [
                    "When playing Goats, notice how individual vulnerability transforms into unshakeable security through calm coordination. You are never truly alone.",
                    "If a Tiger captures a piece, take a calming breath. Setbacks are data, not defeats. Reorganize your defensive lines with steady confidence.",
                    "Ground your feet into the floor. Feel the solidity of the earth beneath you, enduring and tranquil."
                ],
                interactive_trivia: [
                    "A single Tiger can capture by leaping over a lone goat into an empty adjacent node, but cannot leap over two goats grouped together!",
                    "The board consists of a central 4x4 grid crowned with a triangular sanctum known as the 'Tiger's Mountain' ('Bhaga Parvata').",
                    "Shepherds in the Mayurbhanj district still sketch this exact grid on flat boulders using river pebbles while tending cattle."
                ],
                deep_dive: {
                    loreId: "od_bhagachheli_lore_02",
                    badge: "Guardian of the Phalanx",
                    title: "The Tiger & The Flock: Asymmetry in Odishan Strategy",
                    content: "Asymmetric game theory was mastered in ancient Bharath centuries before modern mathematics formulated it. In Bhaga Chheli, 3 ferocious Tigers face 15 modest Goats. The Tigers seek to eliminate enough goats to break all defenses; the Goats seek to surround and immobilize the Tigers until no legal moves remain. The philosophical takeaway is profound: brute force without restraint inevitably falls prey to quiet, organized unity and spatial discipline."
                }
            }
        }
    },

    // --------------------------------------------------------------------------
    // 4. MAHARASHTRA (महाराष्ट्र)
    // --------------------------------------------------------------------------
    maharashtra: {
        regionName: "Maharashtra",
        nativeName: "महाराष्ट्र",
        avatarName: "Pandit Ramdas Shastri",
        avatarTitle: "Maratha Royal Scholar & Warkari Philosopher",
        avatarIcon: "🏰",
        themeColor: "#ff5252",
        accentGlow: "rgba(255, 82, 82, 0.45)",
        games: {
            chaturanga: {
                title: "Chaturanga / Ashtapada (चतुरंग)",
                genre: "Four-Division Epic War Strategy (The Ancestor of Chess)",
                historical_impact: [
                    "Chaturanga is the undisputed ancient Indian ancestor of modern Chess, Shogi, and Xiangqi, documented in Sanskrit epics since the 6th century BCE.",
                    "The Maratha military under Chhatrapati Shivaji Maharaj utilized Ashtapada 8x8 grids to formulate 'Ganimi Kava' (guerrilla hill tactics) and fort relief expeditions.",
                    "The four military divisions—Infantry (Padati), Cavalry (Ashva), Elephants (Gaja), and Chariots (Ratha)—mirrored Bharath's classical military doctrine."
                ],
                cognitive_mapping: [
                    "Multi-branching decision trees activate your Ventromedial Prefrontal Cortex, responsible for long-term strategic forecasting.",
                    "Calculating Knight/Cavalry L-shaped jumps strengthens neuroplasticity and non-linear visual problem solving.",
                    "Sacrificing minor pieces for decisive positional control trains delayed gratification and emotional mastery under pressure."
                ],
                therapeutic_relief: [
                    "Before every move, draw in a slow, deep breath. In Chaturanga as in life, haste creates blindspots, while calm brings clarity.",
                    "Even when under heavy pressure, remember: your King retains dignity on every square. Center your thoughts on what is within your control right now.",
                    "Release tension from your jaw and forehead. Allow the timeless intellect of Sahyadri warriors to guide your strategic vision."
                ],
                interactive_trivia: [
                    "The 8x8 Ashtapada board was originally an uncheckered grid used for dice races before being adapted for military strategy without dice!",
                    "In ancient Chaturanga, the piece that evolved into the Queen was the 'Mantri' (Advisor/General), moving only one diagonal square at a time.",
                    "Persian travelers who visited Bharath in 600 CE were so mesmerized by Chaturanga that they carried it to Persia, where it became known as 'Shatranj'."
                ],
                deep_dive: {
                    loreId: "mh_chaturanga_lore_01",
                    badge: "Grandmaster of the Four Wings",
                    title: "From Ashtapada to the World: The Genesis of Chaturanga",
                    content: "The word 'Chaturanga' signifies four wings (chatur = 4, anga = limbs) of the ancient Indian imperial army. Sanskrit texts such as the Harshacharita state that during king Harsha's reign, 'only on Ashtapada boards did armies clash in battle, not on bloody fields.' The game revolutionized cognitive training by demonstrating that wars could be fought, analyzed, and settled through pure intellect. Every modern chess piece traces its lineage directly back to these ancient Indian archetypes."
                }
            },
            taabla: {
                title: "Taabla / Navkankari (नवकांकरी)",
                genre: "Nine Men's Morris Alignment & Alignment Warfare",
                historical_impact: [
                    "Taabla / Navkankari (Nine Pebbles) is an ancient alignment and node-control game etched onto the ramparts of Raigad, Shivneri, and Sinhagad forts.",
                    "Maratha soldiers on night watch stationed along mountain bastions played Taabla to maintain razor-sharp vigilance and spatial alertness.",
                    "Classical Marathi treatises describe Taabla as a game of 'Sthiti Sanchalan' (the mastery of positioning over raw force)."
                ],
                cognitive_mapping: [
                    "Creating collinear 3-in-a-row mills tests acute pattern detection and parallel processing in your Visual Cortex (Area V1-V4).",
                    "Blocking opponent mills while constructing your own dual-threat forks exercises bifurcated strategic thinking.",
                    "Transitioning between the Placement phase and the Movement phase trains mental adaptability and stage-specific cognitive switching."
                ],
                therapeutic_relief: [
                    "Notice the three concentric squares of the Taabla board. Each square represents an inner boundary of focus. Breathe in peace, exhale tension.",
                    "When an opponent breaks your mill, do not panic. The grid is interconnected; every node lost opens a new coordinate for creative play.",
                    "Feel the calm power of patience. Like the enduring black basalt rocks of the Sahyadri mountains, you possess inner resilience."
                ],
                interactive_trivia: [
                    "Forming three pieces in a straight line is called a 'Mill' or 'Gadi', which earns the player the right to capture one unaligned enemy pawn!",
                    "Archaeologists discovered Taabla boards carved into the 2000-year-old rock-cut Buddhist caves of Karla and Bhaja in Maharashtra.",
                    "When a player is reduced to only 3 pieces, their pawns gain the ability to 'fly' to any vacant node on the board in traditional variations!"
                ],
                deep_dive: {
                    loreId: "mh_taabla_lore_02",
                    badge: "Bastion Commander",
                    title: "Ramparts of Vigilance: Taabla on Sahyadri Forts",
                    content: "The 24-node geometry of Taabla represents mathematical symmetry at its finest. Composed of three concentric squares connected by four perpendicular midpoint lines, the board demands strict economy of movement. In Maratha garrison life, where fort sentries had to monitor steep cliff approaches, Taabla honed the sentry's ability to scan multiple threat vectors simultaneously. A single overlooked diagonal or midpoint could breach the entire defense—mirroring the real-world geometry of mountain fortress defense."
                }
            }
        }
    },

    // --------------------------------------------------------------------------
    // 5. JAMMU & KASHMIR (जम्मू और कश्मीर)
    // --------------------------------------------------------------------------
    jammuKashmir: {
        regionName: "Jammu & Kashmir",
        nativeName: "जम्मू और कश्मीर",
        avatarName: "Ustad Ghulam Rasool",
        avatarTitle: "Pashmina Weaver & Himalayan Sage",
        avatarIcon: "🏔️",
        themeColor: "#b388ff",
        accentGlow: "rgba(179, 136, 255, 0.45)",
        games: {
            zarabzero: {
                title: "Zarabzero (ਜ਼ਰਬ-ਜ਼ੀਰੋ / Zarab Zero)",
                genre: "Himalayan Tactical Grid Strategy & Symmetrical Traps",
                historical_impact: [
                    "Zarabzero was played by mountain travelers and caravan merchants resting at Silk Route caravanserais in Srinagar and Leh.",
                    "The game was designed to be played in high-altitude wooden lodges during severe Kashmiri winters ('Chillai Kalan') when snow isolated mountain valleys.",
                    "Traditional Kashmiri masters taught Zarabzero as an exercise in equanimity, proving that haste on the board leads to quick entrapment, just like haste on an icy mountain pass."
                ],
                cognitive_mapping: [
                    "Anticipating grid intersection traps trains deep logical induction and counter-factual thinking in your Anterior Insula.",
                    "Balancing aggressive line construction against defensive node denial strengthens your cognitive flexibility and situational awareness.",
                    "Calculating recursive move sequences builds high-order abstract reasoning skills."
                ],
                therapeutic_relief: [
                    "Visualize the crisp, tranquil mountain air of the Himalayas. Breathe in cool purity, and breathe out all built-up stress.",
                    "Chillai Kalan teaches us that even the harshest winter gives way to springtime blossoms. Every difficult position on the board carries the seed of renewal.",
                    "Rest your eyes for a moment on the serene violet and amber tones. Allow calm stillness to wash over your mind."
                ],
                interactive_trivia: [
                    "Zarabzero boards in old Srinagar were often carved into walnut wood tables with intricate floral Kashida borders.",
                    "Caravan traders used river-smoothed white quartz and dark slate pebbles from the Lidder River as playing markers.",
                    "The game's name reflects ancient mathematical terminology for intersection coordinates and zero-sum strategic equilibrium."
                ],
                deep_dive: {
                    loreId: "jk_zarabzero_lore_01",
                    badge: "Himalayan Wayfarer",
                    title: "Winter Fires & Silk Routes: The Lore of Zarabzero",
                    content: "During the four-month winter freeze in Kashmir Valley, community life gathered around the warm hearth ('Daan') and copper charcoal braziers ('Kangri'). In these storytelling circles, Zarabzero was passed down through oral tradition. The game is a study in minimal elegance: no complex piece types, yet boundless tactical depth. Master weavers noted that calculating Zarabzero trap lines mirrored the intricate mathematical knotting counts required to weave a royal Pashmina Kani shawl."
                }
            },
            turuf: {
                title: "Turuf (ਤੁਰੁਫ਼ / Trump Trick Deck)",
                genre: "High-Altitude Trick-Taking & Bidding Mastery",
                historical_impact: [
                    "Turuf flourished in the houseboats and royal orchards of Dal Lake as a spirited game of partner coordination and suit deduction.",
                    "Kashmiri nobles and scholars engaged in Turuf tournaments to sharpen their memory of discarded numbers and strategic hand reading.",
                    "The game reflects the rich linguistic and trade crosscurrents of Kashmir, blending indigenous trick-taking mechanics with Central Asian bidding customs."
                ],
                cognitive_mapping: [
                    "Card counting and tracking played trumps intensely exercises your Working Memory buffer in the Prefrontal Cortex.",
                    "Inferring hidden opponent hands from discard patterns stimulates your Theory of Mind and social-cognitive deduction.",
                    "Formulating optimal bidding contracts strengthens mathematical probability estimation and risk governance."
                ],
                therapeutic_relief: [
                    "Pause and listen to the imaginary gentle lapping of Dal Lake's water against a cedar houseboat. Feel your breath settle into calm rhythm.",
                    "When a hand does not go your way, acknowledge it with serenity. In Turuf, a skilled player can turn even a modest hand into a masterpiece of defensive play.",
                    "Inhale calm focus for 4 counts, hold for 4 counts, and exhale for 4 counts. Box breathing restores your mental equilibrium instantly."
                ],
                interactive_trivia: [
                    "The term 'Turuf' is the Kashmiri and Urdu linguistic cousin of the international word 'Trump' (derived from triumph)!",
                    "Master Turuf players in Srinagar could deduce all four players' remaining cards with 95% accuracy by the sixth trick of the round.",
                    "Decks used in royal Kashmiri courts were hand-painted on paper-mâché discs lacquered with saffron and pine resin."
                ],
                deep_dive: {
                    loreId: "jk_turuf_lore_02",
                    badge: "Dal Lake Tactician",
                    title: "Voices across the Water: The Art of Turuf",
                    content: "Turuf is a sophisticated trick-taking discipline that elevated card play into an art of non-verbal intuition. Played in partnerships of two against two, partners were strictly forbidden from speaking. Every message had to be communicated through the timing, suit, and rank of the card played. This forged extraordinary telepathic-like cognitive rapport between partners—teaching that mutual trust and keen observation can triumph over raw power."
                }
            }
        }
    }
};

// Export for browser and node environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUTRADHAR_DATA;
}
