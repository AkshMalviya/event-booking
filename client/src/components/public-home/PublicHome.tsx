import React, { memo } from "react";
import classes from "./index.module.scss";
import Link from "next/link";
import Image from "next/image";

const menu = [{ label: "Home" }, { label: "About Us" }, { label: "Help" }];

const images = [
  "/images/1.jpeg",
  "/images/2.jpeg",
  "/images/3.jpeg",
  "/images/4.jpeg",
];
const PublicHome = () => {
  return (
    <div>
      <div className={classes.header}>
        <h1 className={classes.logo}>Eventz</h1>
        <div className={classes.menus}>
          {menu.map((i) => (
            <div key={i.label + "i"}>
              <Link href={"#"} className={`${classes.menu}  ${classes.active}`}>
                {i.label}
              </Link>
            </div>
          ))}
        </div>
        <div>
          <button className={classes.getStartedBtn}>Get Started</button>
        </div>
      </div>

      <div className={classes.headerWrapper}>
        <div className={classes.heroSection}>
          <div className={classes.leftSection}>
            <h3 className={classes.heading}>
              Turn Your Festival <br /> Into Memorable Experience
            </h3>
            <p className={classes.desc}>
              Platform for planning and organizing your events. We provide you
              with best ideas for any events. so that you can easily plan and
              organize your events
            </p>
            <button className={classes.discoverBtn}>Discover More</button>
          </div>
          <div className={classes.rightSection}>
            <div className={classes.leftImgs}>
              {images.slice(0, 2).map((i) => (
                <div key={i} className={classes.imgContainer}>
                  <Image
                    src={i}
                    alt={i}
                    height={300}
                    width={200}
                    className={classes.img}
                  />
                </div>
              ))}
            </div>

            <div className={classes.rightImgs}>
              {images.slice(2, 5).map((i) => (
                <div key={i} className={classes.imgContainer}>
                  <Image
                    src={i}
                    alt={i}
                    height={300}
                    width={200}
                    className={classes.img}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PublicHome);
