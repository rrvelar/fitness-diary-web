// frames-js.d.ts
declare module "frames.js/next" {
  import * as React from "react"

  export function createFrames(config: { basePath: string }): any

  export interface ButtonProps {
    action: "post" | "link" | "post_redirect"
    target: string
    children?: React.ReactNode
  }

  export const Button: React.FC<ButtonProps>
}
