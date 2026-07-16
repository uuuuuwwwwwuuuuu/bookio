ALTER TABLE "booking_form_styles" ALTER COLUMN "primary_color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_form_styles" ALTER COLUMN "bg_main" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_form_styles" ALTER COLUMN "bg_secondary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_form_styles" ALTER COLUMN "border_color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_form_styles" ALTER COLUMN "text_main" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_form_styles" ALTER COLUMN "text_secondary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_form_meta_data" DROP COLUMN "og_image";--> statement-breakpoint
ALTER TABLE "booking_form_meta_data" DROP COLUMN "theme_color";