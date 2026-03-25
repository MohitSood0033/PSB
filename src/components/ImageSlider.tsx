import React from 'react';
import {IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonItem, IonText} from '@ionic/react';
import { Pagination, A11y, Autoplay, Zoom } from 'swiper/modules';
import {  Swiper, SwiperSlide, } from 'swiper/react';


import 'swiper/css/autoplay';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import './ImageSlider.css';

interface SliderProps{
    slide : string[]
}

const ImageSlider: React.FC<SliderProps> = ({slide}) => {
    return (
        <IonItem className="image-slider-wrapper" lines='none'>
            <IonText className="portal-title">PSB <strong>KUTUMB</strong></IonText>
            <IonImg src="assets/login.png" alt="Login BG" class="login-img"></IonImg>
            <IonItem className="image-slider" lines="none">
                <Swiper
                    modules={[ Pagination,  A11y, Autoplay, Zoom]}
                    spaceBetween={50}
                    slidesPerView={1}
                    autoplay={true} 
                    zoom={true} 
                    loop={true}
                    >
                    {
                        slide.map((image, index) => (
                            <SwiperSlide key={index}>
                                <IonImg src={image} alt={`Slide ${index + 1}`} />
                            </SwiperSlide>
                        ))
                    }                    
                </Swiper>
            </IonItem>
        </IonItem>
      );
}

export default ImageSlider;