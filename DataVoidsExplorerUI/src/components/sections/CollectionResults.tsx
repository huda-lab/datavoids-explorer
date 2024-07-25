import { RootState, store } from "@/model/store";
import { useSelector } from "react-redux";
import { Card } from "../ui/card";
import CollectionResultsRevRank from "@/components/sections/CollectionResultsRevRank";
import CollectionResultsPositions from "@/components/sections/CollectionResultsPositions";

const CollectionResults = () => {
  const status = useSelector((state: RootState) => state.collectionStatus);

  return (
    <>
      <CollectionResultsRevRank rawData={status.results} />
      <CollectionResultsPositions rawData={status.results} />
    </>
  );
};

export default CollectionResults;
