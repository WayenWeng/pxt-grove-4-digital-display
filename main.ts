
let TubeTab: number [] = [0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f,0x77,0x7c,0x39,0x5e,0x79,0x71]

/**
 * Point display switch
 */
enum PointMode {
    //% block=ON
    POINT_ON = 1,
    //% block=OFF
    POINT_OFF = 0
}

/**
 * Display brightness level
 */
enum BrightnessLevel {
    //% block=LV0
    LEVEL_0 = 0,
    //% block=LV1
    LEVEL_1 = 1,
    //% block=LV2
    LEVEL_2 = 2,
    //% block=LV3
    LEVEL_3 = 3,
    //% block=LV4
    LEVEL_4 = 4,
    //% block=LV5
    LEVEL_5 = 5,
    //% block=LV6
    LEVEL_6 = 6,
    //% block=LV7
    LEVEL_7 = 7
}

/**
 * Functions to operate Grove 4 Digital Display module.
 */
//% weight=10 color=#9F79EE icon="\uf108"
namespace Grove_4_Digital_Display
{
    export class TM1637
    {
        clkPin: DigitalPin;
        dataPin: DigitalPin;
        brightnessLevel: number;     
        pointFlag: boolean;
        buf: Buffer;

        private writeByte(wrData: number) 
        {
            for(let i = 0; i < 8; i ++)
            {
                pins.digitalWritePin(this.clkPin, 0);
                if(wrData & 0x01)pins.digitalWritePin(this.dataPin, 1);
                else pins.digitalWritePin(this.dataPin, 0);
                wrData >>= 1;
                pins.digitalWritePin(this.clkPin, 1);
            }
            
            pins.digitalWritePin(this.clkPin, 0); // Wait for ACK
            pins.digitalWritePin(this.dataPin, 1);
            pins.digitalWritePin(this.clkPin, 1);
        }
        
        private start()
        {
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dataPin, 1);
            pins.digitalWritePin(this.dataPin, 0);
            pins.digitalWritePin(this.clkPin, 0);
        }
        
        private stop()
        {
            pins.digitalWritePin(this.clkPin, 0);
            pins.digitalWritePin(this.dataPin, 0);
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dataPin, 1);
        }
        
        private coding(dispData: number): number
        {
            let pointData = 0;
            
            if(this.pointFlag == true)pointData = 0x80;
            else if(this.pointFlag == false)pointData = 0;
            
            if(dispData == 0x7f)dispData = 0x00 + pointData;
            else dispData = TubeTab[dispData] + pointData;
            
            return dispData;
        } 

        /**
         * Show a 4 digits number on display
         * @param dispData value of number
         */
        //% blockId=grove_tm1637_display_number block="%strip|show number|%dispData"
        show(dispData: number)
        {
            if(dispData < 10)
            {
                this.bit(dispData, 3);
                this.bit(0x7f, 2);
                this.bit(0x7f, 1);
                this.bit(0x7f, 0);
                
                this.buf[3] = dispData;
                this.buf[2] = 0x7f;
                this.buf[1] = 0x7f;
                this.buf[0] = 0x7f;
            }
            else if(dispData < 100)
            {
                this.bit(dispData % 10, 3);
                this.bit((dispData / 10) % 10, 2);
                this.bit(0x7f, 1);
                this.bit(0x7f, 0);
                
                this.buf[3] = dispData % 10;
                this.buf[2] = (dispData / 10) % 10;
                this.buf[1] = 0x7f;
                this.buf[0] = 0x7f;
            }
            else if(dispData < 1000)
            {
                this.bit(dispData % 10, 3);
                this.bit((dispData / 10) % 10, 2);
                this.bit((dispData / 100) % 10, 1);
                this.bit(0x7f, 0);
                
                this.buf[3] = dispData % 10;
                this.buf[2] = (dispData / 10) % 10;
                this.buf[1] = (dispData / 100) % 10;
                this.buf[0] = 0x7f;
            }
            else
            {
                this.bit(dispData % 10, 3);
                this.bit((dispData / 10) % 10, 2);
                this.bit((dispData / 100) % 10, 1);
                this.bit((dispData / 1000) % 10, 0);
                
                this.buf[3] = dispData % 10;
                this.buf[2] = (dispData / 10) % 10;
                this.buf[1] = (dispData / 100) % 10;
                this.buf[0] = (dispData / 1000) % 10;
            }
        }
        
        /**
         * Set the brightness level of display at from 0 to 7
         * @param level value of brightness level
         */
        //% blockId=grove_tm1637_set_display_level block="%strip|brightness level to|%level"
        //% level.min=0 level.max=7
        set(level: number)
        {
            this.brightnessLevel = level;
            
            this.bit(this.buf[3], 3);
            this.bit(this.buf[2], 2);
            this.bit(this.buf[1], 1);
            this.bit(this.buf[0], 0);
        }
        
        /**
         * Show a single number from 0 to 9 at a specified digit of Grove - 4-Digit Display
         * @param dispData value of number
         * @param bitAddr value of bit number
         */
        //% blockId=grove_tm1637_display_bit block="%strip|show single number|%dispData|at digit|%bitAddr"
        //% dispData.min=0 dispData.max=9
        //% bitAddr.min=0 bitAddr.max=3
        //% advanced=true
        bit(dispData: number, bitAddr: number)
        {
            if(dispData <= 9 && bitAddr <= 3)
            {
                let segData = 0;
                
                segData = this.coding(dispData);
                this.start();
                this.writeByte(0x44);
                this.stop();
                this.start();
                this.writeByte(bitAddr | 0xc0);
                this.writeByte(segData);
                this.stop();
                this.start();
                this.writeByte(0x88 + this.brightnessLevel);
                this.stop();

                this.buf[bitAddr] = dispData;
            }
        }
        
        /**
         * Turn on or off the colon point on Grove - 4-Digit Display
         * @param pointEn value of point switch
         */
        //% blockId=grove_tm1637_display_point block="%strip|turn|%point|colon point"
        //% advanced=true
        point(point: boolean)
        {
            this.pointFlag = point;
            
            this.bit(this.buf[3], 3);
            this.bit(this.buf[2], 2);
            this.bit(this.buf[1], 1);
            this.bit(this.buf[0], 0);
        }
        
        /**
         * Clear the display
         */
        //% blockId=grove_tm1637_display_clear block="%strip|clear"
        //% advanced=true
        clear()
        {
            this.bit(0x7f, 0x00);
            this.bit(0x7f, 0x01);
            this.bit(0x7f, 0x02);
            this.bit(0x7f, 0x03);
        }
    }
    
    /**
     * Create a new TM1637 driver for 4 digital display
     * @param clkPin value of clk pin number
     * @param dataPin value of data pin number
     */
    //% blockId=tm1637_create block="create clk %clkPin|sda %dataPin"
    export function create(clkPin: DigitalPin, dataPin: DigitalPin): TM1637
    {
        let display = new TM1637();
        
        display.clkPin = clkPin;
        display.dataPin = dataPin;
        display.brightnessLevel = BrightnessLevel.LEVEL_0;
        display.pointFlag = PointMode.POINT_OFF;
        display.buf = pins.createBuffer(4);
        display.clear();
        
        return display;
    }
}