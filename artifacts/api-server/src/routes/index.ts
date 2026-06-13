import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import walletRouter from "./wallet";
import campaignsRouter from "./campaigns";
import analyticsRouter from "./analytics";
import socialAccountsRouter from "./social-accounts";
import oauthRouter from "./oauth";
import koraDepositsRouter from "./kora-deposits";
import koraCardsRouter from "./kora-cards";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(walletRouter);
router.use(campaignsRouter);
router.use(analyticsRouter);
router.use(socialAccountsRouter);
router.use(oauthRouter);
router.use(koraDepositsRouter);
router.use(koraCardsRouter);

export default router;
