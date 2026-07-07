import { Router } from "express";
import type { Response } from "express";
import { Prisma } from "@prisma/client";
import { ADMIN_ROLES, type AuthenticatedUser, type Project, type ProjectMutationRequest } from "@bbc-investor-portal/shared";
import { prisma } from "../lib/prisma.js";
import { parseProjectListQuery, validateProjectMutation } from "../lib/projectValidation.js";
import { requireAuthenticated } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

export const projectsRouter = Router();

const adminRoles = ADMIN_ROLES;
const visibleInvestorStatuses: Project["status"][] = ["COMING_SOON", "OPEN", "FUNDED", "CLOSED"];

const isAdmin = (user: AuthenticatedUser) => ADMIN_ROLES.includes(user.role);

const isValidProjectId = (id: string | undefined) => Boolean(id && /^c[a-z0-9]{24}$/i.test(id));

const investorVisibilityWhere = (): Prisma.ProjectWhereInput => ({
  visibility: { in: ["INVESTORS", "PUBLIC"] },
  status: { in: visibleInvestorStatuses }
});

const projectReadWhere = (user: AuthenticatedUser): Prisma.ProjectWhereInput => ({
  deletedAt: null,
  ...(isAdmin(user) ? {} : investorVisibilityWhere())
});

const sendProjectIdError = (res: Response) => {
  res.status(400).json({ error: "Bad Request", message: "Project id is invalid." });
};

const sendPrismaMutationError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({ error: "Conflict", message: "A project with this slug already exists." });
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    res.status(404).json({ error: "Not Found", message: "Project not found." });
    return true;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({ error: "Service Unavailable", message: "Database is unavailable." });
    return true;
  }

  return false;
};

const sendPrismaReadError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({ error: "Service Unavailable", message: "Database is unavailable." });
    return true;
  }

  return false;
};

const toIso = (date?: Date | null) => (date ? date.toISOString() : null);

const serializeProject = (project: {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  status: Project["status"];
  investmentType: string;
  location: string;
  minimumInvestment: Prisma.Decimal;
  targetRaise: Prisma.Decimal;
  raisedAmount: Prisma.Decimal;
  expectedReturn: string;
  investmentTerm: string;
  openingDate: Date | null;
  closingDate: Date | null;
  heroImageUrl: string | null;
  coverImageUrl: string | null;
  visibility: Project["visibility"];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Project => ({
  id: project.id,
  name: project.name,
  slug: project.slug,
  summary: project.summary,
  description: project.description,
  status: project.status,
  investmentType: project.investmentType,
  location: project.location,
  minimumInvestment: project.minimumInvestment.toString(),
  targetRaise: project.targetRaise.toString(),
  raisedAmount: project.raisedAmount.toString(),
  expectedReturn: project.expectedReturn,
  investmentTerm: project.investmentTerm,
  openingDate: toIso(project.openingDate),
  closingDate: toIso(project.closingDate),
  heroImageUrl: project.heroImageUrl,
  coverImageUrl: project.coverImageUrl,
  visibility: project.visibility,
  deletedAt: toIso(project.deletedAt),
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString()
});

const mutationData = (value: ProjectMutationRequest) => ({
  name: value.name,
  slug: value.slug,
  status: value.status,
  investmentType: value.investmentType,
  location: value.location,
  summary: value.summary,
  description: value.description,
  minimumInvestment: value.minimumInvestment,
  targetRaise: value.targetRaise,
  expectedReturn: value.expectedReturn,
  investmentTerm: value.investmentTerm,
  openingDate: value.openingDate ? new Date(value.openingDate) : null,
  closingDate: value.closingDate ? new Date(value.closingDate) : null,
  heroImageUrl: value.heroImageUrl,
  coverImageUrl: value.coverImageUrl,
  visibility: value.visibility
});

projectsRouter.use(requireAuthenticated);

projectsRouter.get("/", async (req, res, next) => {
  try {
    const query = parseProjectListQuery(req.query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const baseWhere = projectReadWhere(req.user!);
    const where: Prisma.ProjectWhereInput = { ...baseWhere };

    if (query.status) where.status = query.status;
    if (query.location) where.location = query.location;
    if (query.investmentType) where.investmentType = query.investmentType;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
        { summary: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy: Prisma.ProjectOrderByWithRelationInput =
      query.sort === "oldest"
        ? { createdAt: "asc" }
        : query.sort === "targetRaise"
          ? { targetRaise: "desc" }
          : query.sort === "alphabetical"
            ? { name: "asc" }
            : { createdAt: "desc" };

    const [projects, total, locations, investmentTypes] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.project.count({ where }),
      prisma.project.findMany({
        where: baseWhere,
        distinct: ["location"],
        select: { location: true },
        orderBy: { location: "asc" }
      }),
      prisma.project.findMany({
        where: baseWhere,
        distinct: ["investmentType"],
        select: { investmentType: true },
        orderBy: { investmentType: "asc" }
      })
    ]);

    res.json({
      projects: projects.map(serializeProject),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      },
      filters: {
        locations: locations.map((item) => item.location),
        investmentTypes: investmentTypes.map((item) => item.investmentType)
      }
    });
  } catch (error) {
    if (sendPrismaReadError(error, res)) return;
    next(error);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    if (!isValidProjectId(req.params.id)) {
      sendProjectIdError(res);
      return;
    }

    const project = await prisma.project.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!project) {
      res.status(404).json({ error: "Not Found", message: "Project not found." });
      return;
    }

    if (!isAdmin(req.user!) && (project.visibility === "PRIVATE" || !visibleInvestorStatuses.includes(project.status))) {
      res.status(403).json({ error: "Forbidden", message: "You do not have access to this project." });
      return;
    }

    res.json({ project: serializeProject(project) });
  } catch (error) {
    if (sendPrismaReadError(error, res)) return;
    next(error);
  }
});

projectsRouter.post("/", requireRole(...adminRoles), async (req, res, next) => {
  try {
    const validation = validateProjectMutation(req.body);
    if (!validation.ok) {
      res.status(validation.status).json({ error: "Bad Request", message: validation.message });
      return;
    }

    const project = await prisma.project.create({
      data: mutationData(validation.value)
    });

    res.status(201).json({ project: serializeProject(project) });
  } catch (error) {
    if (sendPrismaMutationError(error, res)) return;
    next(error);
  }
});

projectsRouter.put("/:id", requireRole(...adminRoles), async (req, res, next) => {
  try {
    if (!isValidProjectId(req.params.id)) {
      sendProjectIdError(res);
      return;
    }

    const validation = validateProjectMutation(req.body);
    if (!validation.ok) {
      res.status(validation.status).json({ error: "Bad Request", message: validation.message });
      return;
    }

    const existingProject = await prisma.project.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: { id: true }
    });

    if (!existingProject) {
      res.status(404).json({ error: "Not Found", message: "Project not found." });
      return;
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: mutationData(validation.value)
    });

    res.json({ project: serializeProject(project) });
  } catch (error) {
    if (sendPrismaMutationError(error, res)) return;
    next(error);
  }
});

projectsRouter.delete("/:id", requireRole(...adminRoles), async (req, res, next) => {
  try {
    if (!isValidProjectId(req.params.id)) {
      sendProjectIdError(res);
      return;
    }

    const existingProject = await prisma.project.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: { id: true }
    });

    if (!existingProject) {
      res.status(404).json({ error: "Not Found", message: "Project not found." });
      return;
    }

    await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    if (sendPrismaMutationError(error, res)) return;
    next(error);
  }
});
