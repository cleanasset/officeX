import { pgTable, uuid, varchar, text, decimal, integer, timestamp, date, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// 1. Marketplace Owners (DISTINCT from Rent Roll Property Owners)
export const marketplaceOwners = pgTable("marketplace_owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  companyName: varchar("company_name", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  roleType: varchar("role_type", { length: 50 }).default("MARKETPLACE_OWNER").notNull(),
  operatorType: varchar("operator_type", { length: 100 }).default("coworking_operator"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 2. Marketplace Listings (Scraped + User Created Spaces)
export const marketplaceListings = pgTable("marketplace_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 300 }).unique().notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  brandName: varchar("brand_name", { length: 200 }),
  vertical: varchar("vertical", { length: 50 }).notNull(), // coworking | managed_office | commercial | virtual_office | meeting_room | day_pass
  status: varchar("status", { length: 30 }).default("active").notNull(), // active | draft | paused | archived
  city: varchar("city", { length: 100 }).notNull(),
  locality: varchar("locality", { length: 200 }),
  microMarket: varchar("micro_market", { length: 200 }),
  fullAddress: text("full_address"),
  pincode: varchar("pincode", { length: 20 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  totalAreaSqft: integer("total_area_sqft"),
  totalSeats: integer("total_seats"),
  buildingGrade: varchar("building_grade", { length: 20 }).default("Grade A"),
  buildingType: varchar("building_type", { length: 100 }),
  furnishingStatus: varchar("furnishing_status", { length: 50 }),
  images: jsonb("images").$type<string[]>().default([]),
  featuredImage: text("featured_image"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  pricingPlans: jsonb("pricing_plans").$type<{
    hotDeskMonthly?: number;
    dedicatedDeskMonthly?: number;
    privateCabinMonthly?: number;
    managedOfficeMonthly?: number;
    virtualOfficeMonthly?: number;
    dayPassPrice?: number;
    meetingRoomHourly?: number;
    rentPerSqft?: number;
    depositMonths?: number;
    lockInMonths?: number;
    [key: string]: any;
  }>().default({}),
  startingPrice: decimal("starting_price", { precision: 12, scale: 2 }),
  startingPriceUnit: varchar("starting_price_unit", { length: 50 }), // per_seat_month | per_sqft_month | per_hour | per_day | per_month
  description: text("description"),
  operatingHours: jsonb("operating_hours").$type<{
    monSat?: string;
    sun?: string;
    [key: string]: any;
  }>().default({}),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("4.50"),
  totalReviews: integer("total_reviews").default(0),
  nearestMetro: varchar("nearest_metro", { length: 200 }),
  metroDistance: varchar("metro_distance", { length: 100 }),
  consultantName: varchar("consultant_name", { length: 150 }),
  consultantPhone: varchar("consultant_phone", { length: 50 }),
  source: varchar("source", { length: 50 }).default("scraped_myhq"),
  sourceUrl: text("source_url"),
  marketplaceOwnerId: uuid("marketplace_owner_id").references(() => marketplaceOwners.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  cityIdx: index("idx_marketplace_listings_city").on(table.city),
  verticalIdx: index("idx_marketplace_listings_vertical").on(table.vertical),
  statusIdx: index("idx_marketplace_listings_status").on(table.status),
  slugIdx: index("idx_marketplace_listings_slug").on(table.slug),
  brandIdx: index("idx_marketplace_listings_brand").on(table.brandName)
}));

// 3. Marketplace Enquiries
export const marketplaceEnquiries = pgTable("marketplace_enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => marketplaceListings.id),
  listingName: varchar("listing_name", { length: 500 }),
  seekerName: varchar("seeker_name", { length: 255 }).notNull(),
  seekerEmail: varchar("seeker_email", { length: 255 }).notNull(),
  seekerPhone: varchar("seeker_phone", { length: 50 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  seatsRequired: integer("seats_required"),
  moveInDate: varchar("move_in_date", { length: 50 }),
  budget: varchar("budget", { length: 100 }),
  vertical: varchar("vertical", { length: 50 }),
  city: varchar("city", { length: 100 }),
  status: varchar("status", { length: 50 }).default("new").notNull(), // new | contacted | visit_scheduled | negotiating | closed_won | closed_lost
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 4. Marketplace Site Visits
export const marketplaceSiteVisits = pgTable("marketplace_site_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  enquiryId: uuid("enquiry_id").references(() => marketplaceEnquiries.id),
  listingId: uuid("listing_id").references(() => marketplaceListings.id),
  visitorName: varchar("visitor_name", { length: 255 }).notNull(),
  visitorEmail: varchar("visitor_email", { length: 255 }),
  visitorPhone: varchar("visitor_phone", { length: 50 }),
  scheduledDate: varchar("scheduled_date", { length: 50 }).notNull(),
  scheduledTime: varchar("scheduled_time", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // scheduled | completed | cancelled | no_show
  hostName: varchar("host_name", { length: 200 }),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// 5. Marketplace Deals Pipeline
export const marketplaceDeals = pgTable("marketplace_deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  enquiryId: uuid("enquiry_id").references(() => marketplaceEnquiries.id),
  listingId: uuid("listing_id").references(() => marketplaceListings.id),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  dealStage: varchar("deal_stage", { length: 50 }).default("inquiry").notNull(), // inquiry | visit_completed | negotiation | loi_issued | contract_signed | closed_won | closed_lost
  dealValue: decimal("deal_value", { precision: 14, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }),
  targetMoveIn: date("target_move_in"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// Relations
export const marketplaceOwnersRelations = relations(marketplaceOwners, ({ many }) => ({
  listings: many(marketplaceListings)
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one, many }) => ({
  owner: one(marketplaceOwners, {
    fields: [marketplaceListings.marketplaceOwnerId],
    references: [marketplaceOwners.id]
  }),
  enquiries: many(marketplaceEnquiries),
  siteVisits: many(marketplaceSiteVisits),
  deals: many(marketplaceDeals)
}));

export const marketplaceEnquiriesRelations = relations(marketplaceEnquiries, ({ one, many }) => ({
  listing: one(marketplaceListings, {
    fields: [marketplaceEnquiries.listingId],
    references: [marketplaceListings.id]
  }),
  siteVisits: many(marketplaceSiteVisits),
  deals: many(marketplaceDeals)
}));
