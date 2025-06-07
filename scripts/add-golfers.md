# Adding the 8 Dummy Golfers to TeeUp

Since we removed the create golfer endpoint, you'll need to add the golfers directly to the database.

## Option 1: Using Prisma Studio (Recommended for Local Development)

1. Run Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Click on the "Golfer" model

3. Add these 8 golfers:
   - John S | (555) 123-4567
   - Mary J | (555) 234-5678
   - Robert D | (555) 345-6789
   - Sarah W | (555) 456-7890
   - Michael B | (555) 567-8901
   - David L | (555) 678-9012
   - Jennifer M | (555) 789-0123
   - James T | (555) 890-1234

## Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Select the "golfers" table
4. Click "Insert row" and add each golfer

## Option 3: SQL Query

Run this in Supabase SQL Editor:

```sql
INSERT INTO golfers (id, "firstName", "lastInitial", "mobileNumber", "createdAt") VALUES
(gen_random_uuid(), 'John', 'S', '(555) 123-4567', NOW()),
(gen_random_uuid(), 'Mary', 'J', '(555) 234-5678', NOW()),
(gen_random_uuid(), 'Robert', 'D', '(555) 345-6789', NOW()),
(gen_random_uuid(), 'Sarah', 'W', '(555) 456-7890', NOW()),
(gen_random_uuid(), 'Michael', 'B', '(555) 567-8901', NOW()),
(gen_random_uuid(), 'David', 'L', '(555) 678-9012', NOW()),
(gen_random_uuid(), 'Jennifer', 'M', '(555) 789-0123', NOW()),
(gen_random_uuid(), 'James', 'T', '(555) 890-1234', NOW())
ON CONFLICT ("firstName", "lastInitial") 
DO UPDATE SET "mobileNumber" = EXCLUDED."mobileNumber";
```

After adding the golfers, they will appear on the main page of your app! 