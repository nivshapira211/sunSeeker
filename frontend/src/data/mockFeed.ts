export interface Photo {
    id: string;
    imageUrl: string;
    location: string;
    coordinates: { lat: number; lng: number };
    time: string;
    date: string;
    caption?: string;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    type: 'sunrise' | 'sunset';
    exif: {
        camera: string;
        lens: string;
        aperture: string;
        iso: string;
        shutter: string;
    };
}

export const mockFeedData: Photo[] = [
    {
        id: '1',
        imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop',
        location: 'Santorini, Greece',
        coordinates: { lat: 36.3932, lng: 25.4615 },
        time: '06:45 AM',
        date: 'Oct 12, 2025',
        user: {
            id: 'u1',
            name: 'Elena K.',
            avatar: 'https://ui-avatars.com/api/?name=Elena+K&background=FF7E5F&color=fff'
        },
        likes: 243,
        comments: 18,
        type: 'sunrise',
        exif: {
            camera: 'Sony A7III',
            lens: '16-35mm GM',
            aperture: 'f/8',
            iso: '100',
            shutter: '1/200s'
        }
    },
    {
        id: '2',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
        location: 'Maui, Hawaii',
        coordinates: { lat: 20.7984, lng: -156.3319 },
        time: '07:12 PM',
        date: 'Oct 11, 2025',
        user: {
            id: 'u2',
            name: 'Kai M.',
            avatar: 'https://ui-avatars.com/api/?name=Kai+M&background=6A0572&color=fff'
        },
        likes: 856,
        comments: 42,
        type: 'sunset',
        exif: {
            camera: 'Canon R5',
            lens: '24-70mm',
            aperture: 'f/4',
            iso: '400',
            shutter: '1/60s'
        }
    },
    {
        id: '3',
        imageUrl: 'https://images.unsplash.com/photo-1502989642968-94fbdc9eace4?q=80&w=1976&auto=format&fit=crop',
        location: 'Grand Canyon, USA',
        coordinates: { lat: 36.1069, lng: -112.1129 },
        time: '06:15 AM',
        date: 'Oct 10, 2025',
        user: {
            id: 'u3',
            name: 'Sarah J.',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+J&background=FFD700&color=fff'
        },
        likes: 1205,
        comments: 89,
        type: 'sunrise',
        exif: {
            camera: 'Nikon Z7 II',
            lens: '14-24mm',
            aperture: 'f/11',
            iso: '64',
            shutter: '1/15s'
        }
    },
    {
        id: '4',
        imageUrl: 'https://images.unsplash.com/photo-1536152470836-b943b246224c?q=80&w=1938&auto=format&fit=crop',
        location: 'Alps, Switzerland',
        coordinates: { lat: 46.8182, lng: 8.2275 },
        time: '05:55 PM',
        date: 'Oct 09, 2025',
        user: {
            id: 'u4',
            name: 'Marc B.',
            avatar: 'https://ui-avatars.com/api/?name=Marc+B&background=0f172a&color=fff'
        },
        likes: 654,
        comments: 31,
        type: 'sunset',
        exif: {
            camera: 'Fujifilm XT-4',
            lens: '18-55mm',
            aperture: 'f/5.6',
            iso: '160',
            shutter: '1/125s'
        }
    }
];
