import { AppDispatch, RootState, store } from "@/model/store";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { updateSheet, importFromSheet } from "@/model/slices/collection-status";
import { UpdatingSheetStatus } from "@/model/types";
import spinner from "../../assets/spinner.svg";

interface ManualLabelingProps {
  taskId: string;
}

const ManualLabeling: FC<ManualLabelingProps> = ({ taskId }) => {
  const googleSpreadSheetId = useSelector(
    (state: RootState) => state.collectionStatus.googleSpreadSheetId,
  );
  const updatingSheetStatus = useSelector(
    (state: RootState) => state.collectionStatus.updatingSheetStatus,
  );
  const updatingSheetMessage = useSelector(
    (state: RootState) => state.collectionStatus.updatingSheetMessage,
  );
  const dispatch = useDispatch<AppDispatch>();

  const openSheet = useCallback(() => {
    window.open(
      `https://docs.google.com/spreadsheets/d/${googleSpreadSheetId}`,
      "_blank",
    );
  }, [googleSpreadSheetId]);

  const exportToSpreadSheet = useCallback(() => {
    if (googleSpreadSheetId) {
      openSheet();
    } else {
      if (!googleSpreadSheetId) {
        // We only export if we don't have a document that was created during a previous export
        dispatch(updateSheet());
      }
    }
  }, [dispatch, googleSpreadSheetId]);

  const importFromSpreadsheet = useCallback(() => {
    dispatch(importFromSheet());
  }, [dispatch, googleSpreadSheetId]);

  useEffect(() => {
    if (googleSpreadSheetId) {
      openSheet();
    }
  }, [googleSpreadSheetId, openSheet]);

  return (
    <>
      <div>
        A Google Spreadsheet is going to be shared with you. Feel free to change
        the labels and re-import them.
      </div>
      <div className="flex w-full flex-row items-center py-2">
        <div>
          <Button onClick={exportToSpreadSheet} className="mr-2">
            Open labels spreadsheet
            {updatingSheetStatus == UpdatingSheetStatus.Loading && (
              <img
                style={{ marginLeft: "0.5rem" }}
                src={spinner}
                alt="exporting"
              />
            )}
          </Button>
          <Button onClick={importFromSpreadsheet} className="ml-2">
            Re-import from spreadsheet
          </Button>
        </div>
        <div
          className={
            "ml-2 " +
            (updatingSheetStatus == UpdatingSheetStatus.Failed
              ? "text-red-400"
              : "text-green-400")
          }
        >
          {updatingSheetMessage}
        </div>
      </div>
    </>
  );
};

export default ManualLabeling;
