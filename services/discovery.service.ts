import { IProfile, IDiscoveryFilters } from '@/types';
import { SEED_PROFILES, INITIAL_CURRENT_PROFILE } from '@/utils/seedData';
import { calculateDistanceKm } from '@/utils/distance';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import Block from '@/models/Block';
import { resolveToCloudinaryUrl, getCloudinaryProfilePhoto } from '@/lib/cloudinary';

// ── Indian City + District Areas Lookup ─────────────────────────────────────
// Covers major metros AND districts so any Indian user location returns
// realistic nearby locality names. Add more entries as needed.
const CITY_AREAS: Array<{
  name: string;
  latMin: number; latMax: number;
  lngMin: number; lngMax: number;
  areas: string[];
}> = [

  // ── DELHI NCR ──────────────────────────────────────────────────────────────
  {
    name: 'New Delhi',
    latMin: 28.50, latMax: 28.88, lngMin: 76.84, lngMax: 77.35,
    areas: [
      'Lajpat Nagar', 'Hauz Khas', 'Vasant Kunj', 'Saket', 'Malviya Nagar',
      'Greater Kailash', 'Defence Colony', 'Connaught Place', 'Karol Bagh',
      'Rajouri Garden', 'Dwarka', 'Rohini', 'Pitampura', 'Janakpuri',
      'South Extension', 'Green Park', 'Nehru Place', 'Uttam Nagar',
      'Preet Vihar', 'Mayur Vihar', 'Tilak Nagar', 'Shahdara',
    ],
  },
  {
    name: 'Gurugram',
    latMin: 28.38, latMax: 28.52, lngMin: 76.98, lngMax: 77.12,
    areas: [
      'Cyber City', 'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4',
      'Sohna Road', 'MG Road', 'Golf Course Road', 'Sector 14', 'Sector 29',
      'Sector 42', 'Sector 56', 'Palam Vihar', 'South City', 'Ardee City',
    ],
  },
  {
    name: 'Faridabad',
    latMin: 28.32, latMax: 28.47, lngMin: 77.25, lngMax: 77.42,
    areas: [
      'Sector 14', 'Sector 21', 'Sector 29', 'NIT', 'Old Faridabad',
      'Ballabhgarh', 'Neharpar', 'Green Field Colony', 'Surajkund',
      'Sector 86', 'Sector 88', 'Sector 89',
    ],
  },
  {
    name: 'Noida',
    latMin: 28.49, latMax: 28.65, lngMin: 77.30, lngMax: 77.52,
    areas: [
      'Sector 18', 'Sector 62', 'Sector 63', 'Sector 15', 'Sector 44',
      'Sector 50', 'Sector 76', 'Sector 137', 'Film City Road',
      'Greater Noida West', 'Expressway', 'Sector 104', 'Sector 119',
    ],
  },
  {
    name: 'Ghaziabad',
    latMin: 28.62, latMax: 28.74, lngMin: 77.38, lngMax: 77.52,
    areas: [
      'Indirapuram', 'Vaishali', 'Raj Nagar', 'Kaushambi', 'Crossings Republik',
      'Vasundhara', 'Shalimar Garden', 'Mohan Nagar', 'Loni', 'Masuri',
    ],
  },

  // ── HARYANA ───────────────────────────────────────────────────────────────
  {
    name: 'Rewari',
    latMin: 27.88, latMax: 28.18, lngMin: 76.22, lngMax: 76.72,
    areas: [
      'Kosli', 'Rewari City', 'Dharuhera', 'Bawal', 'Palhawas',
      'Jatusana', 'Manethi', 'Gudiyani', 'Nahar', 'Khol',
    ],
  },
  {
    name: 'Rohtak',
    latMin: 28.60, latMax: 28.96, lngMin: 76.40, lngMax: 76.80,
    areas: [
      'Model Town', 'Civil Lines', 'Sunaria', 'Asthal Bohar',
      'Lakhan Majra', 'Meham Road', 'Delhi Road', 'Bohar', 'Rohtak City',
    ],
  },
  {
    name: 'Sonipat',
    latMin: 28.88, latMax: 29.12, lngMin: 76.85, lngMax: 77.12,
    areas: [
      'Kundli', 'Murthal', 'Gohana Road', 'Sonipat City', 'Rai',
      'Kharkhoda', 'Ganaur', 'Manana', 'Rajlu Garhi',
    ],
  },
  {
    name: 'Panipat',
    latMin: 29.24, latMax: 29.48, lngMin: 76.82, lngMax: 77.02,
    areas: [
      'Model Town', 'Panipat City', 'Samalkha', 'Israna', 'Sanoli Road',
      'GT Road', 'Sector 13', 'Sanauli Road', 'Gohana Road',
    ],
  },
  {
    name: 'Karnal',
    latMin: 29.55, latMax: 29.78, lngMin: 76.88, lngMax: 77.08,
    areas: [
      'Model Town', 'Sector 6', 'Sector 7', 'Karnal City', 'Taraori',
      'Indri', 'Assandh', 'Nilokheri', 'Mughal Canal Road',
    ],
  },
  {
    name: 'Ambala',
    latMin: 30.22, latMax: 30.45, lngMin: 76.68, lngMax: 76.95,
    areas: [
      'Ambala Cantt', 'Ambala City', 'Saha', 'Barara', 'Naraingarh',
      'Mullana', 'Shehzadpur', 'GT Road', 'Baldev Nagar',
    ],
  },
  {
    name: 'Hisar',
    latMin: 29.05, latMax: 29.30, lngMin: 75.55, lngMax: 75.90,
    areas: [
      'Model Town', 'Hisar City', 'Hansi', 'Uklana', 'Narnaund',
      'Agroha', 'Barwala', 'Satrod', 'Rajgarh Road',
    ],
  },
  {
    name: 'Bhiwani',
    latMin: 28.68, latMax: 28.92, lngMin: 75.92, lngMax: 76.22,
    areas: [
      'Bhiwani City', 'Loharu', 'Siwani', 'Tosham', 'Behal',
      'Bawani Khera', 'Jui', 'Kairu', 'Dadri',
    ],
  },
  {
    name: 'Jhajjar',
    latMin: 28.40, latMax: 28.68, lngMin: 76.52, lngMax: 76.85,
    areas: [
      'Jhajjar City', 'Bahadurgarh', 'Beri', 'Machhrauli', 'Salhawas',
      'Dighal', 'Matanhail', 'Palhawas', 'Badli',
    ],
  },
  {
    name: 'Mahendragarh',
    latMin: 27.80, latMax: 28.10, lngMin: 76.08, lngMax: 76.35,
    areas: [
      'Narnaul', 'Mahendragarh City', 'Ateli', 'Kanina', 'Nangal Chaudhary',
      'Satnali', 'Nizampur', 'Siha', 'Mohindergarh',
    ],
  },
  {
    name: 'Nuh',
    latMin: 27.85, latMax: 28.18, lngMin: 76.88, lngMax: 77.18,
    areas: [
      'Nuh City', 'Ferozepur Jhirka', 'Punhana', 'Taoru', 'Nagina',
      'Pinangwan', 'Hathin', 'Shikrawa', 'Indri',
    ],
  },
  {
    name: 'Palwal',
    latMin: 28.06, latMax: 28.30, lngMin: 77.28, lngMax: 77.48,
    areas: [
      'Palwal City', 'Hodal', 'Hassanpur', 'Hathin', 'Aurangabad',
      'Prithla', 'Palhawas', 'Banchari', 'Dhatir',
    ],
  },
  {
    name: 'Yamunanagar',
    latMin: 30.05, latMax: 30.25, lngMin: 77.18, lngMax: 77.40,
    areas: [
      'Yamunanagar City', 'Jagadhri', 'Chhachhrauli', 'Radaur',
      'Bilaspur', 'Mustafabad', 'Saraswati Nagar', 'Model Town',
    ],
  },
  {
    name: 'Kurukshetra',
    latMin: 29.88, latMax: 30.05, lngMin: 76.72, lngMax: 76.98,
    areas: [
      'Thanesar', 'Pehowa', 'Shahabad', 'Pipli', 'Ladwa',
      'Ismailabad', 'Babain', 'Kurukshetra City', 'Brahmasarovar',
    ],
  },
  {
    name: 'Kaithal',
    latMin: 29.68, latMax: 29.92, lngMin: 76.32, lngMax: 76.62,
    areas: [
      'Kaithal City', 'Cheeka', 'Guhla', 'Kalayat', 'Siwan',
      'Pundri', 'Rajaund', 'Dhand', 'Keorak',
    ],
  },
  {
    name: 'Jind',
    latMin: 29.22, latMax: 29.52, lngMin: 76.18, lngMax: 76.58,
    areas: [
      'Jind City', 'Narwana', 'Safidon', 'Julana', 'Uchana',
      'Alewa', 'Pillu Khera', 'Singhana', 'Dhatrath',
    ],
  },
  {
    name: 'Fatehabad',
    latMin: 29.38, latMax: 29.62, lngMin: 75.35, lngMax: 75.65,
    areas: [
      'Fatehabad City', 'Tohana', 'Ratia', 'Jakhal', 'Bhuna',
      'Bhattu', 'Gorakhpur', 'Kullan', 'Banawali',
    ],
  },
  {
    name: 'Sirsa',
    latMin: 29.42, latMax: 29.72, lngMin: 74.72, lngMax: 75.12,
    areas: [
      'Sirsa City', 'Dabwali', 'Ellenabad', 'Rania', 'Kalanwali',
      'Mandi Dabwali', 'Nathusari Chopta', 'Baragudha',
    ],
  },
  {
    name: 'Panchkula',
    latMin: 30.58, latMax: 30.82, lngMin: 76.78, lngMax: 77.05,
    areas: [
      'Sector 1', 'Sector 5', 'Sector 9', 'Sector 11', 'Sector 15',
      'Sector 20', 'Sector 25', 'Kalka', 'Raipur Rani', 'Pinjore',
    ],
  },

  // ── PUNJAB ────────────────────────────────────────────────────────────────
  {
    name: 'Chandigarh',
    latMin: 30.65, latMax: 30.78, lngMin: 76.72, lngMax: 76.85,
    areas: [
      'Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Sector 8',
      'Sector 11', 'Manimajra', 'Industrial Area', 'Sector 26',
    ],
  },
  {
    name: 'Ludhiana',
    latMin: 30.82, latMax: 31.02, lngMin: 75.72, lngMax: 75.95,
    areas: [
      'Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Dugri', 'Pakhowal Road',
      'Ferozepur Road', 'Jagraon Bridge', 'Basti Jodhewal', 'Civil Lines',
    ],
  },
  {
    name: 'Amritsar',
    latMin: 31.58, latMax: 31.72, lngMin: 74.82, lngMax: 75.02,
    areas: [
      'Golden Temple Area', 'Green Avenue', 'Ranjit Avenue', 'Lawrence Road',
      'Majitha Road', 'GT Road', 'Batala Road', 'Chheharta',
    ],
  },
  {
    name: 'Jalandhar',
    latMin: 31.28, latMax: 31.42, lngMin: 75.52, lngMax: 75.68,
    areas: [
      'Model Town', 'Guru Nanak Pura', 'Lajpat Nagar', 'Basti Sheikh',
      'Kapurthala Road', 'GT Road', 'Civil Lines', 'New Jawahar Nagar',
    ],
  },
  {
    name: 'Patiala',
    latMin: 30.28, latMax: 30.42, lngMin: 76.32, lngMax: 76.52,
    areas: [
      'Model Town', 'Leela Bhawan', 'Baradari Garden', 'New Colony',
      'Tripuri', 'Urban Estate', 'Rajpura Road', 'Sirhind Road',
    ],
  },

  // ── RAJASTHAN ─────────────────────────────────────────────────────────────
  {
    name: 'Jaipur',
    latMin: 26.78, latMax: 27.02, lngMin: 75.72, lngMax: 75.95,
    areas: [
      'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Tonk Road',
      'C-Scheme', 'MI Road', 'Jagatpura', 'Sanganer', 'Sirsi Road',
      'Raja Park', 'Murlipura', 'Jhotwara',
    ],
  },
  {
    name: 'Jodhpur',
    latMin: 26.22, latMax: 26.42, lngMin: 72.98, lngMax: 73.18,
    areas: [
      'Ratanada', 'Paota', 'Sardarpura', 'Shastri Nagar', 'Pal Road',
      'Sojati Gate', 'Chopasni Road', 'Pratap Nagar', 'Umed Hills',
    ],
  },
  {
    name: 'Udaipur',
    latMin: 24.52, latMax: 24.68, lngMin: 73.62, lngMax: 73.78,
    areas: [
      'Fatehsagar', 'Hiran Magri', 'Udaipole', 'Sukhadia Circle',
      'Bhuwana', 'Pratap Nagar', 'Sector 4', 'Sector 11', 'Ambamata',
    ],
  },
  {
    name: 'Kota',
    latMin: 25.12, latMax: 25.28, lngMin: 75.78, lngMax: 75.95,
    areas: [
      'Talwandi', 'Dadabari', 'Rangbari', 'Mahaveer Nagar', 'Vigyan Nagar',
      'Jawahar Nagar', 'Kunhari', 'Rawatbhata Road',
    ],
  },
  {
    name: 'Alwar',
    latMin: 27.48, latMax: 27.65, lngMin: 76.52, lngMax: 76.72,
    areas: [
      'Alwar City', 'Ramgarh', 'Behror', 'Rajgarh', 'Laxmangarh',
      'Tijara', 'Kishangarh Bas', 'Neemrana', 'Shahjahanpur',
    ],
  },

  // ── UTTAR PRADESH ─────────────────────────────────────────────────────────
  {
    name: 'Agra',
    latMin: 27.08, latMax: 27.25, lngMin: 77.92, lngMax: 78.12,
    areas: [
      'Taj Ganj', 'Civil Lines', 'Kamla Nagar', 'Sikandra', 'Dayal Bagh',
      'Shahganj', 'Sanjay Place', 'Bodla', 'Pratap Pura',
    ],
  },
  {
    name: 'Lucknow',
    latMin: 26.75, latMax: 26.98, lngMin: 80.82, lngMax: 81.05,
    areas: [
      'Hazratganj', 'Gomti Nagar', 'Aliganj', 'Indira Nagar', 'Alambagh',
      'Vibhuti Khand', 'Sector D Aliganj', 'Mahanagar', 'Rajajipuram',
    ],
  },
  {
    name: 'Kanpur',
    latMin: 26.38, latMax: 26.55, lngMin: 80.22, lngMax: 80.42,
    areas: [
      'Civil Lines', 'Swaroop Nagar', 'Kidwai Nagar', 'Kakadeo',
      'Kalyanpur', 'Arya Nagar', 'Govind Nagar', 'Anwarganj',
    ],
  },
  {
    name: 'Varanasi',
    latMin: 25.22, latMax: 25.38, lngMin: 82.92, lngMax: 83.08,
    areas: [
      'Sigra', 'Lanka', 'BHU Area', 'Assi', 'Dashashwamedh',
      'Sarnath', 'Nadesar', 'Orderly Bazar', 'Cantonment',
    ],
  },
  {
    name: 'Meerut',
    latMin: 28.92, latMax: 29.05, lngMin: 77.62, lngMax: 77.78,
    areas: [
      'Shastri Nagar', 'Garh Road', 'Civil Lines', 'Hapur Road',
      'Delhi Road', 'Kanker Khera', 'Begum Bridge', 'Modipuram',
    ],
  },
  {
    name: 'Mathura',
    latMin: 27.42, latMax: 27.58, lngMin: 77.58, lngMax: 77.78,
    areas: [
      'Vrindavan', 'Govardhan', 'Baldeo', 'Mahavan', 'Barsana',
      'Mathura City', 'Masani', 'Deeg Road', 'Raya',
    ],
  },
  {
    name: 'Aligarh',
    latMin: 27.82, latMax: 27.98, lngMin: 77.98, lngMax: 78.18,
    areas: [
      'Ramghat Road', 'Civil Lines', 'Sasni Gate', 'Quarsi', 'Dodhpur',
      'Jamalpur', 'Dhanipur', 'Medical Road', 'Centre Point',
    ],
  },

  // ── MAHARASHTRA ───────────────────────────────────────────────────────────
  {
    name: 'Mumbai',
    latMin: 18.87, latMax: 19.28, lngMin: 72.77, lngMax: 72.98,
    areas: [
      'Bandra West', 'Andheri West', 'Juhu', 'Powai', 'Goregaon',
      'Malad', 'Kandivali', 'Borivali', 'Versova', 'Lokhandwala',
      'Lower Parel', 'Worli', 'Khar', 'Santacruz', 'Vile Parle',
      'Colaba', 'Churchgate', 'Fort', 'Dadar', 'Mulund',
    ],
  },
  {
    name: 'Pune',
    latMin: 18.40, latMax: 18.65, lngMin: 73.75, lngMax: 74.00,
    areas: [
      'Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Wakad', 'Baner',
      'Aundh', 'Kothrud', 'Hadapsar', 'Kharadi', 'Magarpatta',
      'Hinjewadi', 'Shivaji Nagar', 'Camp', 'Sinhagad Road',
    ],
  },
  {
    name: 'Nagpur',
    latMin: 21.05, latMax: 21.22, lngMin: 79.00, lngMax: 79.18,
    areas: [
      'Dharampeth', 'Sitabuldi', 'Sadar', 'Civil Lines', 'Ramdaspeth',
      'Laxmi Nagar', 'Pratap Nagar', 'Manish Nagar', 'Wardha Road',
    ],
  },
  {
    name: 'Nashik',
    latMin: 19.92, latMax: 20.08, lngMin: 73.72, lngMax: 73.88,
    areas: [
      'College Road', 'Gangapur Road', 'Cidco', 'Trimbak Road',
      'Panchvati', 'Indira Nagar', 'Satpur', 'Ambad',
    ],
  },

  // ── KARNATAKA ─────────────────────────────────────────────────────────────
  {
    name: 'Bengaluru',
    latMin: 12.83, latMax: 13.14, lngMin: 77.46, lngMax: 77.75,
    areas: [
      'Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City',
      'Jayanagar', 'JP Nagar', 'Marathahalli', 'Bellandur', 'Sarjapur Road',
      'BTM Layout', 'Richmond Town', 'MG Road', 'Hebbal', 'Malleshwaram',
    ],
  },
  {
    name: 'Mysuru',
    latMin: 12.25, latMax: 12.42, lngMin: 76.58, lngMax: 76.78,
    areas: [
      'Vijayanagar', 'Kuvempunagar', 'Jayalakshmipuram', 'Saraswathipuram',
      'Hebbal', 'Bogadi', 'Bannimantap', 'Yadavagiri',
    ],
  },

  // ── TELANGANA ─────────────────────────────────────────────────────────────
  {
    name: 'Hyderabad',
    latMin: 17.27, latMax: 17.55, lngMin: 78.35, lngMax: 78.62,
    areas: [
      'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Gachibowli', 'HITEC City',
      'Kondapur', 'Miyapur', 'Kukatpally', 'Begumpet', 'Secunderabad',
      'Ameerpet', 'Manikonda', 'Nanakramguda', 'Tolichowki',
    ],
  },
  {
    name: 'Warangal',
    latMin: 17.92, latMax: 18.05, lngMin: 79.52, lngMax: 79.65,
    areas: [
      'Hanamkonda', 'Kazipet', 'Warangal City', 'Subedari',
      'Nakkalagutta', 'Station Road', 'Desaipet', 'Hanmakonda',
    ],
  },

  // ── ANDHRA PRADESH ────────────────────────────────────────────────────────
  {
    name: 'Visakhapatnam',
    latMin: 17.62, latMax: 17.78, lngMin: 83.15, lngMax: 83.32,
    areas: [
      'MVP Colony', 'Steel Plant Area', 'Gajuwaka', 'Dwaraka Nagar',
      'Seethammadhara', 'Maddilapalem', 'Rushikonda', 'Bheemunipatnam',
    ],
  },
  {
    name: 'Vijayawada',
    latMin: 16.42, latMax: 16.58, lngMin: 80.58, lngMax: 80.75,
    areas: [
      'Benz Circle', 'Patamata', 'Moghalrajpuram', 'Suryaraopet',
      'Governorpet', 'Ramavarappadu', 'Kanuru', 'MG Road',
    ],
  },

  // ── TAMIL NADU ────────────────────────────────────────────────────────────
  {
    name: 'Chennai',
    latMin: 12.90, latMax: 13.22, lngMin: 80.10, lngMax: 80.32,
    areas: [
      'T Nagar', 'Adyar', 'Velachery', 'Anna Nagar', 'Nungambakkam',
      'Kilpauk', 'Mylapore', 'Besant Nagar', 'OMR', 'Porur',
      'Ambattur', 'Perambur', 'Teynampet', 'Sholinganallur',
    ],
  },
  {
    name: 'Coimbatore',
    latMin: 10.92, latMax: 11.08, lngMin: 76.92, lngMax: 77.08,
    areas: [
      'RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony',
      'Sidhapudur', 'Race Course', 'Singanallur', 'Mettupalayam Road',
    ],
  },
  {
    name: 'Madurai',
    latMin: 9.88, latMax: 10.02, lngMin: 78.08, lngMax: 78.22,
    areas: [
      'Anna Nagar', 'KK Nagar', 'Iyer Bungalow', 'Tallakulam',
      'Alwarpet', 'Sundarapandyam', 'Thiruppalai', 'Villapuram',
    ],
  },

  // ── KERALA ────────────────────────────────────────────────────────────────
  {
    name: 'Kochi',
    latMin: 9.88, latMax: 10.08, lngMin: 76.22, lngMax: 76.38,
    areas: [
      'Kakkanad', 'Edapally', 'Aluva', 'Kaloor', 'MG Road',
      'Panampilly Nagar', 'Vytilla', 'Palarivattom', 'Kadavanthara',
    ],
  },
  {
    name: 'Thiruvananthapuram',
    latMin: 8.42, latMax: 8.58, lngMin: 76.88, lngMax: 77.02,
    areas: [
      'Kowdiar', 'Pattom', 'Vazhuthacaud', 'Sasthamangalam', 'Karamana',
      'Vellayambalam', 'Kesavadasapuram', 'Nemom', 'Sreekaryam',
    ],
  },

  // ── GUJARAT ───────────────────────────────────────────────────────────────
  {
    name: 'Ahmedabad',
    latMin: 22.92, latMax: 23.12, lngMin: 72.48, lngMax: 72.68,
    areas: [
      'Satellite', 'Prahlad Nagar', 'Bodakdev', 'Navrangpura', 'Vastrapur',
      'Maninagar', 'Chandkheda', 'Thaltej', 'SG Highway', 'Gota',
    ],
  },
  {
    name: 'Surat',
    latMin: 21.12, latMax: 21.28, lngMin: 72.78, lngMax: 72.92,
    areas: [
      'Adajan', 'Vesu', 'Pal', 'Athwa', 'Katargam',
      'Udhna', 'Piplod', 'Althan', 'City Light',
    ],
  },
  {
    name: 'Vadodara',
    latMin: 22.25, latMax: 22.40, lngMin: 73.15, lngMax: 73.32,
    areas: [
      'Alkapuri', 'Fatehgunj', 'Vadiwadi', 'Karelibaug', 'Nizampura',
      'Gotri', 'Waghodia Road', 'Vasna Road', 'Makarpura',
    ],
  },

  // ── WEST BENGAL ───────────────────────────────────────────────────────────
  {
    name: 'Kolkata',
    latMin: 22.40, latMax: 22.70, lngMin: 88.25, lngMax: 88.45,
    areas: [
      'Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Alipore',
      'Tollygunge', 'Behala', 'Dum Dum', 'Rajarhat', 'Gariahat',
      'Jadavpur', 'Bhowanipore', 'Howrah', 'Barasat',
    ],
  },

  // ── MADHYA PRADESH ────────────────────────────────────────────────────────
  {
    name: 'Indore',
    latMin: 22.62, latMax: 22.78, lngMin: 75.78, lngMax: 75.98,
    areas: [
      'Vijay Nagar', 'Palasia', 'Scheme 54', 'Scheme 78', 'Bhawarkua',
      'AB Road', 'Rau', 'Nipania', 'Super Corridor', 'Rajwada',
    ],
  },
  {
    name: 'Bhopal',
    latMin: 23.18, latMax: 23.32, lngMin: 77.32, lngMax: 77.52,
    areas: [
      'Arera Colony', 'MP Nagar', 'New Market', 'Kolar Road',
      'Hoshangabad Road', 'Shivaji Nagar', 'Jahangirabad', 'Berasia Road',
    ],
  },
];

/**
 * Given user's GPS coordinates, returns the matching city's nearby area list.
 * First tries bounding box match, then falls back to nearest city by distance.
 */
function getNearbyAreas(userLat: number, userLng: number): { cityName: string; areas: string[] } {
  // 1. Try exact bounding box match
  for (const city of CITY_AREAS) {
    if (
      userLat >= city.latMin && userLat <= city.latMax &&
      userLng >= city.lngMin && userLng <= city.lngMax
    ) {
      return { cityName: city.name, areas: city.areas };
    }
  }

  // 2. Fallback: find nearest city by straight-line distance
  const cityCenters: Record<string, { lat: number; lng: number }> = {
    'New Delhi':  { lat: 28.64, lng: 77.22 },
    'Gurugram':   { lat: 28.45, lng: 77.03 },
    'Noida':      { lat: 28.57, lng: 77.39 },
    'Mumbai':     { lat: 19.08, lng: 72.88 },
    'Bengaluru':  { lat: 12.97, lng: 77.59 },
    'Hyderabad':  { lat: 17.39, lng: 78.47 },
    'Pune':       { lat: 18.52, lng: 73.86 },
    'Chennai':    { lat: 13.08, lng: 80.27 },
    'Kolkata':    { lat: 22.57, lng: 88.36 },
    'Jaipur':     { lat: 26.91, lng: 75.79 },
  };

  let nearestCity = CITY_AREAS[0]; // default Delhi
  let minDist = Infinity;

  for (const city of CITY_AREAS) {
    const center = cityCenters[city.name];
    if (!center) continue;
    const dLat = userLat - center.lat;
    const dLng = userLng - center.lng;
    const d = Math.sqrt(dLat * dLat + dLng * dLng); // simple Euclidean in degrees
    if (d < minDist) {
      minDist = d;
      nearestCity = city;
    }
  }

  return { cityName: nearestCity.name, areas: nearestCity.areas };
}
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoredProfile extends IProfile {
  compatibilityScore: number; // e.g. 88 -> "88% Compatible"
  compatibilityBreakdown?: {
    interests: number;
    distance: number;
    age: number;
    goal: number;
    activity: number;
    completeness: number;
  };
}

export function calculateCompatibilityScore(
  myProfile: Partial<IProfile>,
  candidate: Partial<IProfile>,
  distanceKm: number = 5,
  maxDistanceKm: number = 50
): { score: number; breakdown: any } {
  const myInterests: string[] = (myProfile.passions || myProfile.interests || []) as string[];
  const candidateInterests: string[] = (candidate.passions || candidate.interests || []) as string[];

  // 1. Interests Overlap (25%)
  const shared = myInterests.filter((item: string) => candidateInterests.includes(item));
  const interestScore = Math.min(
    25,
    Math.round((shared.length / Math.max(1, Math.min(myInterests.length, 5))) * 25)
  );

  // 2. Distance Fit (20%)
  const distRatio = Math.max(0, 1 - distanceKm / Math.max(10, maxDistanceKm));
  const distanceScore = Math.round(distRatio * 20);

  // 3. Age Fit (20%)
  const myAge = myProfile.age || 26;
  const candAge = candidate.age || 24;
  const ageDiff = Math.abs(myAge - candAge);
  const ageScore = ageDiff <= 2 ? 20 : ageDiff <= 5 ? 16 : Math.max(4, 20 - ageDiff * 2);

  // 4. Relationship Goal Match (15%)
  const goalScore =
    myProfile.relationshipGoal && candidate.relationshipGoal
      ? myProfile.relationshipGoal === candidate.relationshipGoal
        ? 15
        : 8
      : 10;

  // 5. Activity (10%)
  const activityScore = candidate.onlineStatus === 'online' ? 10 : 7;

  // 6. Profile Completeness (10%)
  const photosCount = candidate.photos?.length || 1;
  const hasBio = Boolean(candidate.bio && candidate.bio.length > 20);
  const isVerified = Boolean(candidate.isVerified);
  const completenessScore =
    (photosCount >= 3 ? 4 : 2) + (hasBio ? 3 : 1) + (isVerified ? 3 : 1);

  const total = Math.min(99, Math.max(45, interestScore + distanceScore + ageScore + goalScore + activityScore + completenessScore));

  return {
    score: total,
    breakdown: {
      interests: interestScore,
      distance: distanceScore,
      age: ageScore,
      goal: goalScore,
      activity: activityScore,
      completeness: completenessScore,
    },
  };
}

export async function getDiscoveryStack(
  currentUserId: string,
  userLocation: { lng: number; lat: number },
  filters?: Partial<IDiscoveryFilters>
): Promise<ScoredProfile[]> {
  const conn = await connectToDatabase();
  const minAge = filters?.minAge || 18;
  const maxAge = filters?.maxAge || 45;
  const maxDistanceKm = filters?.maxDistanceKm || 50;

  if (conn) {
    try {
      // Find IDs already liked, passed, or blocked
      const [swipedLikes, swipedPasses, blockedUsers, blockingUsers] = await Promise.all([
        Like.find({ fromUser: currentUserId }).select('toUser').lean(),
        Pass.find({ fromUser: currentUserId }).select('toUser').lean(),
        Block.find({ blockerId: currentUserId }).select('blockedId').lean(),
        Block.find({ blockedId: currentUserId }).select('blockerId').lean(),
      ]);

      const excludedUserIds = [
        currentUserId,
        ...swipedLikes.map((l: any) => l.toUser.toString()),
        ...swipedPasses.map((p: any) => p.toUser.toString()),
        ...blockedUsers.map((b: any) => b.blockedId.toString()),
        ...blockingUsers.map((b: any) => b.blockerId.toString()),
      ];

      const query: any = {
        userId: { $nin: excludedUserIds },
      };

      const dbProfiles = await Profile.find(query).lean();
      const myProfile = (await Profile.findOne({ userId: currentUserId }).lean()) || INITIAL_CURRENT_PROFILE;

      const scoredList: ScoredProfile[] = dbProfiles.map((p: any) => {
        const [pLng, pLat] = p.location?.coordinates || [77.209, 28.6139];
        const seed = p._id ? p._id.toString().split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) : 1;

        // ── Managed Profile Distance Spoofing ──────────────────────────────
        // Managed profiles get realistic nearby distances (3–20 km) instead
        // of their real city coords which could be 1000+ km away.
        let effectiveLng = pLng;
        let effectiveLat = pLat;
        let dist: number;

        if (p.isManaged) {
          const targetKm = 3 + (seed % 18); // 3 km to 20 km
          const degOffset = targetKm / 111;
          const angle = (seed % 360) * (Math.PI / 180);
          effectiveLat = userLocation.lat + degOffset * Math.cos(angle);
          effectiveLng = userLocation.lng + degOffset * Math.sin(angle) / Math.cos(userLocation.lat * Math.PI / 180);
          dist = targetKm;

          // Assign a local neighbourhood name relative to the user's city
          const { cityName, areas } = getNearbyAreas(userLocation.lat, userLocation.lng);
          const areaName = areas[seed % areas.length];
          p._relativeCity = `${areaName}, ${cityName}`;
        } else {
          dist = calculateDistanceKm(userLocation.lat, userLocation.lng, pLat, pLng);
        }
        // ────────────────────────────────────────────────────────────────────

        // Calculate age from dateOfBirth
        const birthdate = new Date(p.dateOfBirth);
        let computedAge = new Date().getFullYear() - birthdate.getFullYear();
        if (isNaN(computedAge) || computedAge < 18) computedAge = 24;

        const profileObj: IProfile = {
          _id: p._id.toString(),
          userId: p.userId.toString(),
          name: p.name || p.firstName || 'Candidate',
          age: computedAge,
          birthdate: p.dateOfBirth?.toISOString() || '2001-01-01',
          gender: p.gender,
          interestedIn: p.interestedIn?.[0] || 'everyone',
          photos: (p.photos && p.photos.length > 0)
            ? p.photos.map((ph: any, pIdx: number) => resolveToCloudinaryUrl(ph, (p.isManaged ? (seed % 130) + 1 : pIdx + 1)))
            : [getCloudinaryProfilePhoto(p.isManaged ? (seed % 130) + 1 : 1)],
          bio: p.bio || '',
          job: p.job || p.occupation || '',
          school: p.school || p.education || '',
          location: {
            type: 'Point',
            coordinates: [effectiveLng, effectiveLat],
            city: p._relativeCity || p.city || 'New Delhi',
            country: p.country || 'India',
          },
          passions: p.passions || p.interests || [],
          prompts: [],
          relationshipGoal: p.relationshipGoal,
          isVerified: p.verificationStatus === 'verified' || p.isVerified === true,
          onlineStatus: 'online',
          distanceKm: dist,
        };

        const { score, breakdown } = calculateCompatibilityScore(myProfile as any, profileObj, dist, maxDistanceKm);

        return {
          ...profileObj,
          compatibilityScore: score,
          compatibilityBreakdown: breakdown,
        };
      });

      return scoredList
        .filter((p) => p.age >= minAge && p.age <= maxAge && (p.distanceKm || 0) <= maxDistanceKm)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (e) {
      console.warn('DB Discovery error, using fallback seed stack:', e);
    }
  }

  // Fallback to rich seed profiles with calculated compatibility score
  return SEED_PROFILES.map((p) => {
    const [pLng, pLat] = p.location.coordinates;
    const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, pLat, pLng);
    const { score, breakdown } = calculateCompatibilityScore(INITIAL_CURRENT_PROFILE, p, dist, maxDistanceKm);

    return {
      ...p,
      distanceKm: dist,
      compatibilityScore: score,
      compatibilityBreakdown: breakdown,
    };
  })
    .filter((p) => p.age >= minAge && p.age <= maxAge && (p.distanceKm || 0) <= maxDistanceKm)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
