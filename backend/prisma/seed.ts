import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with enhanced data...')

  // Create sample artists with enhanced image and social platform support
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        name: 'The Midnight Echo',
        bio: 'Alternative rock band from Portland known for their ethereal soundscapes and powerful live performances.',
        imageUrl: '/uploads/artists/1_profile.webp',
        imageAlt: 'The Midnight Echo band performing on stage with atmospheric lighting',
        imageSizes: {
          thumbnail: '/uploads/artists/1_thumbnail.webp',
          profile: '/uploads/artists/1_profile.webp',
          featured: '/uploads/artists/1_featured.webp'
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/artist/midnightecho',
          instagram: 'https://instagram.com/midnightecho',
          youtube: 'https://youtube.com/@midnightecho',
          bandcamp: 'https://midnightecho.bandcamp.com'
        },
        isFeatured: true
      }
    }),
    prisma.artist.create({
      data: {
        name: 'Luna Ray',
        bio: 'Electronic dream-pop artist creating atmospheric music that blends vintage synthesizers with modern production.',
        imageUrl: '/uploads/artists/2_profile.webp',
        imageAlt: 'Luna Ray in a ethereal studio setup with vintage synthesizers',
        imageSizes: {
          thumbnail: '/uploads/artists/2_thumbnail.webp',
          profile: '/uploads/artists/2_profile.webp',
          featured: '/uploads/artists/2_featured.webp'
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/artist/lunaray',
          instagram: 'https://instagram.com/lunaray',
          soundcloud: 'https://soundcloud.com/lunaray',
          tiktok: 'https://tiktok.com/@lunaray'
        },
        isFeatured: true
      }
    }),
    prisma.artist.create({
      data: {
        name: 'Crimson Valley',
        bio: 'Indie folk duo combining rich harmonies with storytelling that captures the essence of small-town America.',
        imageUrl: '/uploads/artists/3_profile.webp',
        imageAlt: 'Crimson Valley duo performing acoustic set in rustic setting',
        imageSizes: {
          thumbnail: '/uploads/artists/3_thumbnail.webp',
          profile: '/uploads/artists/3_profile.webp',
          featured: '/uploads/artists/3_featured.webp'
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/artist/crimsonvalley',
          instagram: 'https://instagram.com/crimsonvalley',
          youtube: 'https://youtube.com/@crimsonvalley',
          facebook: 'https://facebook.com/crimsonvalley',
          bandcamp: 'https://crimsonvalley.bandcamp.com'
        },
        isFeatured: false
      }
    })
  ])

  console.log(`✅ Created ${artists.length} artists`)

  // Create sample releases with enhanced cover art and streaming platform support
  const releases = await Promise.all([
    prisma.release.create({
      data: {
        artistId: artists[0].id,
        title: 'Neon Dreams',
        type: 'album',
        releaseDate: new Date('2024-03-15'),
        coverArtUrl: '/uploads/releases/1_medium.webp',
        coverArtAlt: 'Neon Dreams album cover featuring abstract neon cityscapes',
        coverArtSizes: {
          small: '/uploads/releases/1_small.webp',
          medium: '/uploads/releases/1_medium.webp',
          large: '/uploads/releases/1_large.webp'
        },
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/neondreams123',
          appleMusic: 'https://music.apple.com/album/neondreams123',
          youtube: 'https://music.youtube.com/playlist?list=neondreams',
          bandcamp: 'https://midnightecho.bandcamp.com/album/neon-dreams'
        },
        description: 'A journey through midnight cityscapes and electric emotions.'
      }
    }),
    prisma.release.create({
      data: {
        artistId: artists[0].id,
        title: 'Electric Pulse',
        type: 'single',
        releaseDate: new Date('2024-01-20'),
        coverArtUrl: '/uploads/releases/2_medium.webp',
        coverArtAlt: 'Electric Pulse single cover with lightning and neon elements',
        coverArtSizes: {
          small: '/uploads/releases/2_small.webp',
          medium: '/uploads/releases/2_medium.webp',
          large: '/uploads/releases/2_large.webp'
        },
        streamingLinks: {
          spotify: 'https://open.spotify.com/track/electricpulse456',
          appleMusic: 'https://music.apple.com/song/electricpulse456',
          soundcloud: 'https://soundcloud.com/midnightecho/electric-pulse'
        },
        description: 'The lead single that started it all.'
      }
    }),
    prisma.release.create({
      data: {
        artistId: artists[1].id,
        title: 'Cosmic Waves',
        type: 'ep',
        releaseDate: new Date('2024-02-10'),
        coverArtUrl: '/uploads/releases/3_medium.webp',
        coverArtAlt: 'Cosmic Waves EP cover with nebula and space imagery',
        coverArtSizes: {
          small: '/uploads/releases/3_small.webp',
          medium: '/uploads/releases/3_medium.webp',
          large: '/uploads/releases/3_large.webp'
        },
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/cosmicwaves789',
          bandcamp: 'https://lunaray.bandcamp.com/album/cosmic-waves',
          soundcloud: 'https://soundcloud.com/lunaray/sets/cosmic-waves'
        },
        description: 'Five tracks exploring the vastness of space and emotion.'
      }
    }),
    prisma.release.create({
      data: {
        artistId: artists[2].id,
        title: 'Hometown Stories',
        type: 'album',
        releaseDate: new Date('2023-11-05'),
        coverArtUrl: '/uploads/releases/4_medium.webp',
        coverArtAlt: 'Hometown Stories album cover featuring rustic countryside imagery',
        coverArtSizes: {
          small: '/uploads/releases/4_small.webp',
          medium: '/uploads/releases/4_medium.webp',
          large: '/uploads/releases/4_large.webp'
        },
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/hometownstories101',
          appleMusic: 'https://music.apple.com/album/hometownstories101',
          bandcamp: 'https://crimsonvalley.bandcamp.com/album/hometown-stories'
        },
        description: 'Tales from the heartland, told through folk melodies.'
      }
    })
  ])

  console.log(`✅ Created ${releases.length} releases`)

  // Create sample news articles
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: 'The Midnight Echo Announces World Tour',
        content: `We're thrilled to announce that The Midnight Echo will be embarking on their first world tour this summer! Starting in Portland and making stops across North America, Europe, and Australia, this tour promises to be an unforgettable experience.

The tour kicks off on July 15th at the Crystal Ballroom in Portland, Oregon, and will feature songs from their latest album "Neon Dreams" as well as fan favorites from their catalog.

Tickets go on sale this Friday at 10 AM local time. VIP packages include meet & greet opportunities and exclusive merchandise.

"We can't wait to connect with our fans around the world," says lead vocalist Alex Chen. "These songs were meant to be shared live, and we're ready to bring that energy to every city we visit."

Check our tour dates page for full schedule and ticket information.`,
        author: 'Music Label Team',
        slug: 'midnight-echo-world-tour-announcement',
        publishedAt: new Date('2024-06-10T14:00:00Z')
      }
    }),
    prisma.news.create({
      data: {
        title: 'Luna Ray\'s "Cosmic Waves" Reaches #1 on Electronic Charts',
        content: `Luna Ray's latest EP "Cosmic Waves" has reached the #1 spot on the Electronic Music Charts, marking a major milestone for the dream-pop artist.

The five-track EP, released in February, has been praised by critics for its innovative blend of vintage synthesizers and modern production techniques. Songs like "Stellar Drift" and "Nebula Dance" have become fan favorites on streaming platforms.

"I'm overwhelmed by the response," Luna Ray shared in a recent interview. "This EP represents years of experimentation and growth as an artist. To see it resonate with so many people is incredibly humbling."

The success of "Cosmic Waves" has led to several festival bookings for the summer, including appearances at Dreamscape Festival and Electronic Paradise.

Luna Ray is currently working on her debut full-length album, expected to release later this year.`,
        author: 'Sarah Martinez',
        slug: 'luna-ray-cosmic-waves-number-one',
        publishedAt: new Date('2024-06-05T16:30:00Z')
      }
    }),
    prisma.news.create({
      data: {
        title: 'New Artist Spotlight: Crimson Valley',
        content: `We're excited to welcome Crimson Valley to our label family! This indie folk duo from Nashville brings authentic storytelling and beautiful harmonies to our roster.

Comprised of siblings Emma and Jake Morrison, Crimson Valley draws inspiration from their rural upbringing and the stories of their community. Their music captures the essence of small-town America with a contemporary folk sound.

Their debut album "Hometown Stories" showcases their songwriting prowess across 12 tracks that range from intimate acoustic ballads to foot-stomping folk anthems.

"We're thrilled to partner with a label that understands our vision," says Emma Morrison. "They believe in the power of authentic storytelling through music."

Look for Crimson Valley on tour this fall, with dates being announced soon. Their album "Hometown Stories" is available now on all streaming platforms.`,
        author: 'Music Label Team',
        slug: 'new-artist-spotlight-crimson-valley',
        publishedAt: new Date('2024-05-28T12:00:00Z')
      }
    })
  ])

  console.log(`✅ Created ${news.length} news articles`)

  // Create sample concerts
  const concerts = await Promise.all([
    prisma.concert.create({
      data: {
        artistId: artists[0].id,
        venue: 'Crystal Ballroom',
        city: 'Portland',
        country: 'USA',
        date: new Date('2025-07-15'),
        time: new Date('1970-01-01T20:00:00'),
        ticketLink: 'https://tickets.crystalballroom.com/midnight-echo',
        notes: 'World tour kickoff show. VIP packages available.'
      }
    }),
    prisma.concert.create({
      data: {
        artistId: artists[0].id,
        venue: 'The Fillmore',
        city: 'San Francisco',
        country: 'USA',
        date: new Date('2025-07-18'),
        time: new Date('1970-01-01T21:00:00'),
        ticketLink: 'https://thefillmore.com/events/midnight-echo',
        notes: 'Special guest: Local indie band'
      }
    }),
    prisma.concert.create({
      data: {
        artistId: artists[0].id,
        venue: 'Paradiso',
        city: 'Amsterdam',
        country: 'Netherlands',
        date: new Date('2025-08-10'),
        time: new Date('1970-01-01T20:30:00'),
        ticketLink: 'https://paradiso.nl/midnight-echo',
        notes: 'European tour leg begins'
      }
    }),
    prisma.concert.create({
      data: {
        artistId: artists[1].id,
        venue: 'Dreamscape Festival',
        city: 'Los Angeles',
        country: 'USA',
        date: new Date('2025-08-20'),
        time: new Date('1970-01-01T18:00:00'),
        ticketLink: 'https://dreamscapefest.com/lineup',
        notes: 'Main stage performance'
      }
    }),
    prisma.concert.create({
      data: {
        artistId: artists[1].id,
        venue: 'Electronic Paradise',
        city: 'Miami',
        country: 'USA',
        date: new Date('2025-09-05'),
        time: new Date('1970-01-01T19:30:00'),
        ticketLink: 'https://electronicparadise.com/tickets',
        notes: 'Late night set at the Nebula Stage'
      }
    }),
    prisma.concert.create({
      data: {
        artistId: artists[2].id,
        venue: 'The Bluebird Cafe',
        city: 'Nashville',
        country: 'USA',
        date: new Date('2025-10-12'),
        time: new Date('1970-01-01T19:00:00'),
        ticketLink: null,
        notes: 'Intimate acoustic show. Limited seating, first come first served.'
      }
    }),
    prisma.concert.create({
      data: {
        artistId: artists[2].id,
        venue: 'Folk & Harmony Festival',
        city: 'Austin',
        country: 'USA',
        date: new Date('2025-10-25'),
        time: new Date('1970-01-01T16:00:00'),
        ticketLink: 'https://folkharmonyfest.com',
        notes: 'Afternoon set at the Riverside Stage'
      }
    })
  ])

  console.log(`✅ Created ${concerts.length} concerts`)
  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })