const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const stations = [
    {
      stationId: '1',
      stationName: 'Downtown Charging Hub',
      address: '123 Main St, Downtown',
      chargerType: 'DC Fast',
      powerRating: 150,
      pricePerKwh: 0.35,
      availableChargers: 8,
      lat: 40.7128,
      lng: -74.006,
    },
    {
      stationId: '2',
      stationName: 'Shopping Mall Station',
      address: '456 Mall Dr',
      chargerType: 'Level 2',
      powerRating: 7,
      pricePerKwh: 0.28,
      availableChargers: 14,
      lat: 40.7505,
      lng: -73.9934,
    },
    {
      stationId: '3',
      stationName: 'Airport Charging Station',
      address: '789 Airport Rd',
      chargerType: 'DC Fast',
      powerRating: 120,
      pricePerKwh: 0.42,
      availableChargers: 5,
      lat: 40.6413,
      lng: -73.7781,
    },
    {
      stationId: '4',
      stationName: 'Park Street Level 2',
      address: '321 Park Ave',
      chargerType: 'Level 2',
      powerRating: 7,
      pricePerKwh: 0.25,
      availableChargers: 8,
      lat: 40.73061,
      lng: -73.935242,
    },
    {
      stationId: '5',
      stationName: 'Tech Park DC Fast',
      address: '999 Tech Ave',
      chargerType: 'DC Fast',
      powerRating: 200,
      pricePerKwh: 0.48,
      availableChargers: 3,
      lat: 40.758,
      lng: -73.9855,
    },
    {
      stationId: '6',
      stationName: 'Highway Rest Stop',
      address: 'Mile 45, Interstate 95',
      chargerType: 'DC Fast',
      powerRating: 150,
      pricePerKwh: 0.38,
      availableChargers: 6,
      lat: 40.9006,
      lng: -73.7821,
    },
  ]

  for (const s of stations) {
    await prisma.station.upsert({
      where: { stationId: s.stationId },
      update: s,
      create: s,
    })
  }

  console.log('Seeded stations')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
