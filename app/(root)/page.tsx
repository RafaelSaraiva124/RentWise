import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";

const Home = async () => {
  return (
    <div>
      <Button>click me</Button>
    </div>
  );
};
export default Home;
