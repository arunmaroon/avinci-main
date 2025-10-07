/**
 * Indian Demographics Service
 * Generates realistic Indian names, locations, and demographics
 */

class IndianDemographicsService {
    static indianNames = {
        male: [
            'Arjun', 'Rahul', 'Vikram', 'Suresh', 'Rajesh', 'Amit', 'Deepak', 'Kiran', 
            'Naveen', 'Pradeep', 'Sandeep', 'Ravi', 'Kumar', 'Anil', 'Sunil', 'Raj',
            'Vikash', 'Manoj', 'Suresh', 'Prakash', 'Vinod', 'Ashok', 'Ramesh', 'Suresh',
            'Mukesh', 'Dinesh', 'Jagdish', 'Harish', 'Mahesh', 'Suresh', 'Rakesh', 'Naresh'
        ],
        female: [
            'Priya', 'Kavya', 'Anita', 'Sunita', 'Rekha', 'Meera', 'Shanti', 'Lakshmi', 
            'Sita', 'Gita', 'Radha', 'Pooja', 'Neha', 'Shruti', 'Divya', 'Kavita',
            'Rashmi', 'Sushma', 'Usha', 'Geeta', 'Sarita', 'Manju', 'Renu', 'Suman',
            'Kiran', 'Asha', 'Vandana', 'Poonam', 'Seema', 'Ritu', 'Anju', 'Deepa'
        ]
    };

    static indianCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 
        'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 
        'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
        'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli',
        'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Navi Mumbai', 'Solapur',
        'Vijayawada', 'Kolhapur', 'Amritsar', 'Noida', 'Ranchi', 'Howrah', 'Coimbatore'
    ];

    static indianStates = [
        'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana',
        'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh',
        'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh',
        'Bihar', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir', 'Goa', 'Tripura',
        'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Arunachal Pradesh', 'Sikkim'
    ];

    static indianEducation = [
        '10th Pass', '12th Pass', 'Diploma', 'Bachelor\'s', 'Master\'s', 'MBA', 'PhD',
        'CA', 'Engineering', 'Medical', 'Law', 'Commerce', 'Arts', 'Science',
        'B.Tech', 'M.Tech', 'BBA', 'B.Com', 'M.Com', 'B.Sc', 'M.Sc', 'B.A', 'M.A'
    ];

    static indianProfessions = [
        'Software Engineer', 'Data Analyst', 'Marketing Manager', 'Sales Executive',
        'Business Analyst', 'Project Manager', 'HR Manager', 'Accountant', 'Teacher',
        'Doctor', 'Engineer', 'Designer', 'Consultant', 'Banker', 'Insurance Agent',
        'Real Estate Agent', 'Freelancer', 'Entrepreneur', 'Government Employee',
        'Journalist', 'Lawyer', 'Architect', 'Pharmacist', 'Nurse', 'Pilot'
    ];

    static indianCompanies = [
        'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Accenture', 'IBM', 'Cognizant',
        'Capgemini', 'L&T', 'Reliance', 'Tata', 'Adani', 'Bharti Airtel', 'ICICI Bank',
        'HDFC Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra', 'Bajaj', 'Hero', 'Maruti',
        'Mahindra', 'Ashok Leyland', 'ONGC', 'NTPC', 'Coal India', 'Indian Oil'
    ];

    static incomeRanges = [
        '₹2-5L', '₹5-10L', '₹10-20L', '₹20-50L', '₹50L+'
    ];

    static familyStatus = [
        'Single', 'Married', 'Divorced', 'Widowed'
    ];

    /**
     * Generate Indian demographics
     */
    static generateIndianDemographics(overrides = {}) {
        const isMale = Math.random() > 0.5;
        const selectedName = this.indianNames[isMale ? 'male' : 'female'][
            Math.floor(Math.random() * this.indianNames[isMale ? 'male' : 'female'].length)
        ];
        
        const city = this.indianCities[Math.floor(Math.random() * this.indianCities.length)];
        const state = this.indianStates[Math.floor(Math.random() * this.indianStates.length)];
        const profession = this.indianProfessions[Math.floor(Math.random() * this.indianProfessions.length)];
        const company = this.indianCompanies[Math.floor(Math.random() * this.indianCompanies.length)];
        const education = this.indianEducation[Math.floor(Math.random() * this.indianEducation.length)];
        const incomeRange = this.incomeRanges[Math.floor(Math.random() * this.incomeRanges.length)];
        const familyStatus = this.familyStatus[Math.floor(Math.random() * this.familyStatus.length)];

        return {
            name: overrides.name || selectedName,
            age: overrides.age || Math.floor(Math.random() * 35) + 25, // 25-60
            gender: overrides.gender || (isMale ? 'Male' : 'Female'),
            role_title: overrides.role_title || profession,
            company: overrides.company || company,
            location: overrides.location || `${city}, ${state}`,
            education: overrides.education || education,
            income_range: overrides.income_range || incomeRange,
            family_status: overrides.family_status || familyStatus,
            ...overrides
        };
    }

    /**
     * Generate realistic face photo URL based on demographics
     */
    static generateUnsplashPhoto(demographics) {
        const { name, age, gender, role_title, location } = demographics;
        
        // Use a more reliable face photo service
        // This will generate consistent, high-quality face photos
        const seed = this.generateSeedFromDemographics(demographics);
        
        // Use DiceBear API for consistent face generation
        const diceBearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=400`;
        
        return diceBearUrl;
    }

    /**
     * Generate a consistent seed from demographics
     */
    static generateSeedFromDemographics(demographics) {
        const { name, age, gender, role_title, location } = demographics;
        
        // Create a consistent seed based on demographics
        const seedString = `${name}-${age}-${gender}-${role_title}-${location}`;
        
        // Simple hash function to create a consistent seed
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            const char = seedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * Generate a random photo ID for Unsplash (simplified approach)
     */
    static generateRandomPhotoId() {
        // This is a simplified approach - in production, you'd want to use actual Unsplash API
        const photoIds = [
            '1507003211169-0a1dd7d8c5ea', '1500648767791-00dcc994a43e', '1494790108755-2616b612b786',
            '1507003211169-0a1dd7d8c5ea', '1500648767791-00dcc994a43e', '1494790108755-2616b612b786',
            '1472099645785-5658abf4ff4e', '1507003211169-0a1dd7d8c5ea', '1500648767791-00dcc994a43e',
            '1494790108755-2616b612b786', '1472099645785-5658abf4ff4e', '1507003211169-0a1dd7d8c5ea'
        ];
        return photoIds[Math.floor(Math.random() * photoIds.length)];
    }

    /**
     * Generate realistic Indian phone number
     */
    static generateIndianPhoneNumber() {
        const prefixes = ['+91-9', '+91-8', '+91-7', '+91-6'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 100000000).toString().padStart(9, '0');
        return `${prefix}${number}`;
    }

    /**
     * Generate Indian address
     */
    static generateIndianAddress(city) {
        const areas = [
            'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5',
            'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5',
            'Block A', 'Block B', 'Block C', 'Block D', 'Block E',
            'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'
        ];
        
        const area = areas[Math.floor(Math.random() * areas.length)];
        const houseNumber = Math.floor(Math.random() * 999) + 1;
        
        return `${houseNumber}, ${area}, ${city}`;
    }
}

module.exports = IndianDemographicsService;
