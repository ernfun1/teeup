import { dateToString, stringToDate, getTodayUTC, isSameDay } from '../lib/date-utils'

console.log('Testing date utilities...\n')

// Test 1: Date to string conversion
console.log('1. Testing dateToString:')
const testDates = [
  new Date('2025-06-09'),
  new Date('2025-06-09T00:00:00'),
  new Date('2025-06-09T23:59:59'),
  new Date(Date.UTC(2025, 5, 9)),
  getTodayUTC()
]

testDates.forEach(date => {
  console.log(`   ${date.toISOString()} -> ${dateToString(date)}`)
})

// Test 2: String to date conversion
console.log('\n2. Testing stringToDate:')
const testStrings = ['2025-06-09', '2025-06-10', '2025-12-31', '2025-01-01']

testStrings.forEach(str => {
  const date = stringToDate(str)
  console.log(`   "${str}" -> ${date.toISOString()} -> back to "${dateToString(date)}"`)
})

// Test 3: Round-trip conversion
console.log('\n3. Testing round-trip conversion:')
const roundTripTests = ['2025-06-09', '2025-06-15', '2025-12-31']

roundTripTests.forEach(original => {
  const date = stringToDate(original)
  const back = dateToString(date)
  const match = original === back ? '✅' : '❌'
  console.log(`   ${match} "${original}" -> Date -> "${back}"`)
})

// Test 4: Same day comparison
console.log('\n4. Testing isSameDay:')
const today = getTodayUTC()
const tomorrow = new Date(today)
tomorrow.setUTCDate(today.getUTCDate() + 1)

console.log(`   Today vs Today: ${isSameDay(today, getTodayUTC()) ? '✅ Same' : '❌ Different'}`)
console.log(`   Today vs Tomorrow: ${isSameDay(today, tomorrow) ? '❌ Same' : '✅ Different'}`)

// Test 5: Timezone independence
console.log('\n5. Testing timezone independence:')
console.log(`   Current timezone offset: ${new Date().getTimezoneOffset()} minutes`)

// Create dates in different ways that might have timezone issues
const localMidnight = new Date('2025-06-09')
const utcMidnight = new Date(Date.UTC(2025, 5, 9))

console.log(`   Local midnight: ${localMidnight.toISOString()} -> "${dateToString(localMidnight)}"`)
console.log(`   UTC midnight: ${utcMidnight.toISOString()} -> "${dateToString(utcMidnight)}"`)

// The key test: both should produce the same date string
const localStr = dateToString(localMidnight)
const utcStr = dateToString(utcMidnight)
console.log(`   Both produce same string? ${localStr === utcStr ? '✅ Yes' : `❌ No (${localStr} vs ${utcStr})`}`)

console.log('\n✅ Date utility tests complete!') 