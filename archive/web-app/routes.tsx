import { createBrowserRouter } from "react-router";
import { ParadisePage } from "./pages/ParadisePage";
import { MainWorldPage } from "./pages/MainWorldPage";
import { DailyChallengePage } from "./pages/DailyChallengePage";
import { FunQuizPage } from "./pages/FunQuizPage";
import { ErrorBookPage } from "./pages/ErrorBookPage";
import { PetHousePage } from "./pages/PetHousePage";
import { CardCenterPage } from "./pages/CardCenterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ClassroomPage } from "./pages/ClassroomPage";
import { ArenaPage } from "./pages/ArenaPage";
import { PrincipalOfficePage } from "./pages/PrincipalOfficePage";
import { CardWarehousePage } from "./pages/CardWarehousePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ParadisePage,
  },
  {
    path: "/main-world",
    Component: MainWorldPage,
  },
  {
    path: "/daily-challenge",
    Component: DailyChallengePage,
  },
  {
    path: "/fun-quiz",
    Component: FunQuizPage,
  },
  {
    path: "/error-book",
    Component: ErrorBookPage,
  },
  {
    path: "/pet-house",
    Component: PetHousePage,
  },
  {
    path: "/card-center",
    Component: CardCenterPage,
  },
  {
    path: "/profile",
    Component: ProfilePage,
  },
  {
    path: "/classroom",
    Component: ClassroomPage,
  },
  {
    path: "/arena",
    Component: ArenaPage,
  },
  {
    path: "/principal-office",
    Component: PrincipalOfficePage,
  },
  {
    path: "/card-warehouse",
    Component: CardWarehousePage,
  },
]);