import { type RouteConfig, index,route } from "@react-router/dev/routes";

export default [
    index("routes/auth.tsx"),
    route("video", 'routes/video.tsx')

] satisfies RouteConfig;
