import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample artists
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        name: 'The Midnight Echo',
        bio: 'Alternative rock band from Portland known for their ethereal soundscapes and powerful live performances.',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        socialLinks: {
          instagram: 'https://instagram.com/midnightecho',
          spotify: 'https://open.spotify.com/artist/midnightecho',
          twitter: 'https://twitter.com/midnightecho'
        },
        isFeatured: true
      }
    }),
    prisma.artist.create({
      data: {
        name: 'Luna Ray',
        bio: 'Electronic dream-pop artist creating atmospheric music that blends vintage synthesizers with modern production.',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
        socialLinks: {
          instagram: 'https://instagram.com/lunaray',
          spotify: 'https://open.spotify.com/artist/lunaray',
          website: 'https://lunaray.music'
        },
        isFeatured: true
      }
    }),
    prisma.artist.create({
      data: {
        name: 'Crimson Valley',
        bio: 'Indie folk duo combining rich harmonies with storytelling that captures the essence of small-town America.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        socialLinks: {
          instagram: 'https://instagram.com/crimsonvalley',
          spotify: 'https://open.spotify.com/artist/crimsonvalley',
          youtube: 'https://youtube.com/@crimsonvalley'
        },
        isFeatured: false
      }
    })
  ])

  console.log(`✅ Created ${artists.length} artists`)

  // Create sample releases
  const releases = await Promise.all([
    prisma.release.create({
      data: {
        artistId: artists[0].id,
        title: 'Neon Dreams',
        type: 'album',
        releaseDate: new Date('2024-03-15'),
        coverArtUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/neondreams',
          appleMusic: 'https://music.apple.com/album/neondreams',
          youtubeMusic: 'https://music.youtube.com/playlist/neondreams'
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
        coverArtUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
        streamingLinks: {
          spotify: 'https://open.spotify.com/track/electricpulse',
          appleMusic: 'https://music.apple.com/song/electricpulse'
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
        coverArtUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500',
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/cosmicwaves',
          bandcamp: 'https://lunaray.bandcamp.com/album/cosmic-waves'
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
        coverArtUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        streamingLinks: {
          spotify: 'https://open.spotify.com/album/hometownstories',
          appleMusic: 'https://music.apple.com/album/hometownstories'
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