import {
  Container as MapDiv,
  NaverMap,
  useNavermaps,
  Overlay,
  Marker,
  useMap,
  useListener,
} from "react-naver-maps";

import React, { useState, useCallback, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../../../Style/theme";
import axios from "axios";
import currentLocation from "../../../Assets/img/currentPosition.svg";
import ActivePicker from "../../../Assets/img/_Picker=장애인 가능.png";
import currentSpot from "../../../Assets/Map/currentLocation.png";
import CancelIcon from "../../../Assets/Map/FindRoute/Cancel_Icon.png";
import Oneimage from "../../../Assets/Map/FindRoute/FirstNum.png";
import Twoimage from "../../../Assets/Map/FindRoute/SecondNum.png";
import BackIcon from "../../../Assets/Map/FindRoute/BackIcon.png";

const AppFindRoute = () => {
  const navermaps = window.naver.maps;
  const [naverMap, setNaverMap] = useState();
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const handleZoomChanged = useCallback((zoom) => {
    console.log(`zoom: ${zoom}`);
  }, []);
  const [sliderVisible, setSliderVisible] = useState(false);
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState(null);
  const [newPosition, setNewPosition] = useState(null);

  const handleSliderClose = () => {
    setSliderVisible(false);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarkerInfo(marker);
    setSliderVisible(true);
  };

  // 검색어 관련 코드
  const [searchValue1, setSearchValue1] = useState("");
  const [searchValue2, setSearchValue2] = useState("");
  const [isSearchClicked, setIsSearchClicked] = useState(true);

  const handleSearchChange1 = (event) => {
    setSearchValue1(event.target.value);
  };
  const handleSearchChange2 = (event) => {
    setSearchValue2(event.target.value);
  };

  const handleSearchClick = () => {
    // 검색을 눌렀을 때의 동작
    setIsSearchClicked(true);
  };

  const LastList = [
    {
      id: 1,
      place: "한동대학교",
      time: "12.3",
    },
    {
      id: 2,
      place: "서울숲",
      time: "12.3",
    },
    {
      id: 3,
      place: "전주성",
      time: "12.4",
    },
    {
      id: 4,
      place: "포항 해변의 꽃게",
      time: "12.5",
    },
    {
      id: 5,
      place: "한동대학교",
      time: "12.5",
    },
  ];

  const [list, setList] = useState(LastList);

  const handleDelete = (id) => {
    const newList = list.filter((item) => item.id !== id);
    setList(newList);
  };

  // 현재 위치 받아오기
  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newPosition = new navermaps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setCurrentPosition(newPosition);
          setNewPosition(newPosition);
          console.log("My current location: ", newPosition);
          // 위도와 경도를 주소로 변환하는 API 호출
          try {
            const reverseGeocodeResponse = await axios.post(
              `http://localhost:3001/reverseGeocoding`, // 서버 URL에 맞게 수정해주세요.
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            );

            const address = reverseGeocodeResponse.data.address;
            console.log(
              "읽은 데이터 :",
              reverseGeocodeResponse.data.addressResult
            );
            setSearchValue1(address);
          } catch (error) {
            console.error("Error getting address from coordinates:", error);
          }
        },
        (error) => {
          console.error("Error getting current position:", error);
          window.alert("현재 위치를 찾을 수 없습니다.");
        }
      );
    } else {
      window.alert("브라우저가 위치 정보를 지원하지 않습니다.");
    }
  }, [navermaps, setCurrentPosition, setSearchValue1]);

  const handleToCurrentPosition = () => {
    console.log("Trying to pan to current position", newPosition);

    if (naverMap) {
      naverMap.panTo(newPosition);
    } else {
      console.log("NaverMap is not initialized yet.");
    }
  };

  useEffect(() => {
    // 페이지 로딩 시에 현재 위치 받아오기
    handleCurrentLocation();
    // 무장애 여행 정보 API 호출
    axios
      .get(dataForbstacleApi)
      .then((response) => {
        console.log("무장애 여행정보 동기화 관광 데이터 :", response.data);
        const data = response.data.response.body.items.item;
        const newMarkers = data.map((item, index) => ({
          key: index,
          position: new navermaps.LatLng(item.mapy, item.mapx),
          title: item.title,
        }));
        setMarkers(newMarkers);
      })
      .catch((error) => {
        console.error("Error fetching data from the API", error);
      });
  }, [handleCurrentLocation, navermaps, dataForbstacleApi]);

  return (
    <ThemeProvider theme={theme}>
      <MapDiv
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          display: "flex",
          backgroundColor: "#fff",
          alignItems: "center",
          overflow: "hidden",
        }}
        onInitialized={(map) => setNaverMap(map)}
      >
        <SearchContainer>
          {!isSearchClicked ? (
            <>
              <FlexDiv bottom={8}>
                <ImageDiv
                  src={require("../../../Assets/Map/FindRoute/Frame1.png")}
                  right={10}
                  width={16}
                  height={16}
                />
                <SearchInput
                  value={searchValue1}
                  onChange={handleSearchChange1}
                  image={Oneimage}
                />
                <CancelButton ButtonImage={CancelIcon} />
              </FlexDiv>
              <FlexDiv>
                <ImageDiv
                  src={require("../../../Assets/Map/FindRoute/Frame1.png")}
                  right={10}
                  width={16}
                  height={16}
                />
                <SearchInput
                  value={searchValue2}
                  onChange={handleSearchChange2}
                  placeholder="도착지 입력"
                  image={Twoimage}
                  onClick={handleSearchClick}
                />
                <CancelButton ButtonImage={CancelIcon} />
              </FlexDiv>
            </>
          ) : (
            <>
              <FlexDiv bottom={16}>
                <CancelButton ButtonImage={BackIcon} />
                <FinRouteInput placeholder="어디로 가볼까요?" />
                <SearchButton>검색</SearchButton>
              </FlexDiv>
              <Hr />
              <FlexDiv>
                <BookMarkIcon
                  src={require("../../../Assets/Map/FindRoute/BookMarkIcon.png")}
                />
                <BookMarkText>저장한 장소</BookMarkText>
              </FlexDiv>
            </>
          )}
        </SearchContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "scroll",
            // position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            zIndex: 500,
          }}
        >
          <img
            id="current"
            src={currentLocation}
            onClick={handleToCurrentPosition}
            alt="Current Location"
            style={{ cursor: "pointer" }}
          />
        </div>
        {currentPosition && (
          <NaverMap
            // draggable
            defaultCenter={currentPosition}
            defaultZoom={13}
            onZoomChanged={handleZoomChanged}
          >
            <Marker
              position={currentPosition}
              icon={{
                url: currentSpot,
                scaledSize: new navermaps.Size(40, 40),
              }}
            />
            {markers.map((marker) => (
              <Marker
                key={marker.key}
                position={marker.position}
                title={marker.title}
                icon={{
                  url: ActivePicker,
                }}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}
          </NaverMap>
        )}
        <SearchContents>
          {list.map((item) => (
            <ListItem key={item.id}>
              {item.place}
              <ListDiv justify={"flex-end"} flex={"center"}>
                {item.time}
                <CancelButton2
                  onClick={() => handleDelete(item.id)}
                  ButtonImage={CancelIcon}
                  width={16}
                  height={16}
                />
              </ListDiv>
            </ListItem>
          ))}
        </SearchContents>
      </MapDiv>
    </ThemeProvider>
  );
};

export default AppFindRoute;

const dataForbstacleApi =
  "https://apis.data.go.kr/B551011/KorWithService1/areaBasedSyncList1?numOfRows=500&MobileOS=ETC&MobileApp=asdf&_type=json&serviceKey=jY6dYXyUO1l9FcTho0NZvdOzVGZDgBV3%2BiJXkviw%2BB8J1yRS%2BfNP%2FH7gAcUyJ4PbM8JG0Mf3YtXmgKfUg3AqdA%3D%3D";

const SearchContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  padding: 10px;
  display: flex;
  flex-direction: row;
  z-index: 1000;
  background-color: white;
  height: auto;
  flex-direction: column;
`;

const SearchContents = styled.div`
  position: absolute;
  margin-top: 110px;
  top: 0;
  right: 0;
  left: 0;
  padding: 10px;
  display: flex;
  flex-direction: row;
  z-index: 1000;
  background-color: white;
  height: 100%;
  flex-direction: column;
`;

const CancelButton2 = styled.button`
  width: ${(props) => props.width || 24}px;
  height: ${(props) => props.height || 24}px;
  background: url(${(props) => props.ButtonImage}) no-repeat center/contain;
  border: none;
  background-size: 24px;
  margin-left: 16px;
  margin-right: 16px;
`;

const ListItem = styled.li`
  list-style: none;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--black-70, #5b5b5b);
  font-family: "Pretendard";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  width: 100%;
  border-bottom: 1px solid #E3E3E3;
  margin-bottom: 16px;
  padding-bottom: 16px;
  padding-left: 12px;
`;

const ListDiv = styled.div`
  display: flex;
  justify-content: ${(props) => props.justify || "flex-start"};
  margin-bottom: ${(props) => props.bottom}px;
  align-items: center;
  align-items: ${(props) => props.flex};
  color: var(--black-50, #a5a5a5);
  font-family: "Pretendard";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
`;

const FlexDiv = styled.div`
  display: flex;
  width: 98%;
  justify-content: ${(props) => props.justify || "flex-start"};
  margin-bottom: ${(props) => props.bottom}px;
  align-items: center;
  align-items: ${(props) => props.flex};
`;

const ImageDiv = styled.img`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-right: ${(props) => props.right}px;
  margin-left: ${(props) => props.left}px;
  margin-top: ${(props) => props.top}px;
`;

const SearchInput = styled.input`
  width: calc(90%);
  border: 1px solid var(--black-30, #e3e3e3);
  border-radius: 4px;
  text-indent: 20px;
  height: 32px;
  background-image: url(${(props) => props.image});
  background-position: left 10px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-left: 16px;

  &::placeholder {
    color: var(--black-50, #a5a5a5);
    font-family: "Pretendard";
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%;
  }
  &:focus {
    background-image: none;
    background-position: -10px center;
    text-indent: 0;
    width: calc(90%);
  }
  &:focus:not(:placeholder-shown) {
    color: var(--black-90, #1f1f1f);
    font-family: "Pretendard";
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%;
  }
`;

const CancelButton = styled.button`
  width: ${(props) => props.width || 24}px;
  height: ${(props) => props.height || 24}px;
  background: url(${(props) => props.ButtonImage}) no-repeat center/contain;
  border: none;
  background-size: 32px;
  margin-right: 12px;
`;

const BookMarkIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-left: 4px;
`;

const BookMarkText = styled.div`
  color: var(--Primary_pink100, #ed685a);
  font-family: "Pretendard";
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%;
  margin-left: 8px;
`;

const SearchButton = styled.button`
  width: 49px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  background: ${(props) => props.theme.colors.Primary_pink100};
  color: var(--White, #fff);
  font-family: "Pretendard";
  font-style: normal;
  font-size: ${(props) => props.theme.Web_fontSizes.Body3};
  font-weight: ${(props) => props.theme.fontWeights.Body3};
  line-height: ${(props) => props.theme.LineHeight.Body3};
  border: none;
`;

const FinRouteInput = styled.input`
  border: none;
  width: calc(96%);

  &::placeholder {
    color: var(--black-50, #a5a5a5);
    font-family: "Pretendard";
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%;
  }

  &:focus {
    outline: none;

    &::placeholder {
      color: var(--black-90, #1f1f1f);
      font-family: "Pretendard";
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 140%;
    }
  }
`;

const Hr = styled.hr`
  width: 100%;
  height: 0.8px;
  background-color: #a5a5a5;
  margin-top: 37px;
  position: absolute;
  border: none;
  left: 0;
  right: 0;
`;
