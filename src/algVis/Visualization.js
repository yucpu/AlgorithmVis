import React from 'react'
import '../algVis/Visualization.css'
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const alg = [{ name: "Merge Sort", img: require('../assets/Sort.png'), path:"/mergeSort"},
{ name: "Closet Pair Point", img: require("../assets/closet_pair.png"), path:"/closetPairPoint"}];

export default function Visualization() {
  const navigate = useNavigate();
  return (
    <div className='algLib'>
      <div className='algContainer'>
        {alg.map((item, index) => (

          <Card className='algVis' key={index}>
            <CardActionArea onClick={()=>{navigate(item.path)}}>
              <CardMedia
                component="img"
                className='cardImage'
                image={item.img}
              />

              <CardContent>
                <Typography gutterBottom variant="h6">
                  {item.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

        ))
        }
      </div>
    </div>
  )
}
