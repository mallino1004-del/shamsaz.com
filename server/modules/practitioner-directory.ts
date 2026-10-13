import type express from "express";
import { db } from "../db/index.ts";
import { publishedPractitioner } from "./practitioner-access.ts";
export function registerPractitionerDirectoryRoutes(app: express.Express) {
  app.get("/api/practitioners", async (_req, res, next) => {
    try {
      const result = await db.query(
        `SELECT p.id,p.display_name AS "displayName",p.specialty,p.category_id AS "categoryId",c.label AS "categoryLabel",p.city,p.address,p.phone,p.source_url AS "sourceUrl",CASE WHEN p.source_url IS NULL THEN 'registered' ELSE 'imported' END AS "profileOrigin",p.account_id AS "accountId",p.source_checked_at AS "sourceCheckedAt",p.photo_bytes IS NOT NULL AS "hasPhoto" FROM public_practitioners p JOIN practitioner_categories c ON c.id=p.category_id WHERE ${publishedPractitioner("p")} ORDER BY c.sort_order,p.display_name`,
      );
      const categories = await db.query(
        `SELECT c.id,c.label,count(p.id)::integer AS count FROM practitioner_categories c JOIN public_practitioners p ON p.category_id=c.id AND ${publishedPractitioner("p")} GROUP BY c.id,c.label,c.sort_order ORDER BY c.sort_order,c.label`,
      );
      res.json({
        practitioners: result.rows.map(({ hasPhoto, ...p }) => ({
          ...p,
          photoUrl: hasPhoto
            ? `/api/practitioners/${encodeURIComponent(p.id)}/photo`
            : null,
        })),
        categories: categories.rows,
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/practitioners/:id/photo", async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT photo_bytes,photo_mime FROM public_practitioners p WHERE p.id=$1 AND ${publishedPractitioner("p")} AND photo_bytes IS NOT NULL`,
        [req.params.id],
      );
      if (!result.rowCount)
        return res.status(404).json({
          error: {
            code: "PHOTO_NOT_FOUND",
            message: "تصویر قابل نمایش وجود ندارد.",
          },
        });
      res.setHeader("Content-Type", result.rows[0].photo_mime);
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      res.send(result.rows[0].photo_bytes);
    } catch (e) {
      next(e);
    }
  });
}
