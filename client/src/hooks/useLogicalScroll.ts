import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { SCROLL_HEIGHT, VIEWPORT_HEIGHT } from "../constants/viewer";


interface LogicalScrollResult {
  scrollHeight: number;
  scrollTop: number;
  logicalOffset: number;
  onScroll: (
    event: React.UIEvent<HTMLDivElement>
  ) => void;
}

export function useLogicalScroll(
  fileSize: number
): LogicalScrollResult {
  const [scrollTop, setScrollTop] =
    useState(0);

  const maxScrollTop =
    Math.max(
      1,
      SCROLL_HEIGHT - VIEWPORT_HEIGHT
    );

  const logicalOffset =
    fileSize <= 0
      ? 0
      : Math.floor(
          (scrollTop / maxScrollTop) *
            Math.max(0, fileSize - 1)
        );

  const onScroll = useCallback(
    (
      event: React.UIEvent<HTMLDivElement>
    ) => {
      setScrollTop(
        event.currentTarget.scrollTop
      );
    },
    []
  );

  return useMemo(
    () => ({
      scrollHeight: SCROLL_HEIGHT,
      scrollTop,
      logicalOffset,
      onScroll,
    }),
    [
      scrollTop,
      logicalOffset,
      onScroll,
    ]
  );
}