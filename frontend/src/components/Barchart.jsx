import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';

// #region Sample data


// #endregion
function  BarChartDisplay ({data , activeList}) {
  console.log('BarChartDisplay rendered with data:', data, 'and activeList:', activeList);
  function findInArray(array, value) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === value) {
        return true;
      }
    }
    return false;
  }
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
      
    >
     
      <XAxis dataKey="name" />
      <YAxis width="auto"   interval={0}/>
      <Tooltip />
      <Legend />
      {data.length !==0 && Object.keys(data[7]).filter(key =>{ return key !== 'name' && findInArray(activeList, key.toString()) }).map((key, index) => (
        <Bar key={key} dataKey={key} fill={`hsl(${(index * 60) % 360}, 70%, 50%)`} radius={[10, 10, 0, 0]} />
      ))}
     
      <RechartsDevtools />
    </BarChart>
  );
};

export default BarChartDisplay;